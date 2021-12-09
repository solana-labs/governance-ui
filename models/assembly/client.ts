import * as anchor from '@project-serum/anchor'

import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { associatedTokenAccount, mint } from 'easy-spl'
import * as bs58 from 'bs58'
import { chunk } from './chunk'
import { untilConfirmed } from './sleep'

const MEMO_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

export class AssemblyClient {
  constructor(public program: anchor.Program) {}

  static async connect(
    programId: anchor.web3.PublicKey,
    provider: anchor.Provider
  ): Promise<AssemblyClient> {
    const idl = await anchor.Program.fetchIdl(programId, provider)
    console.log('idl', programId.toString(), idl)
    const program = new anchor.Program(idl!, programId, provider)
    return new AssemblyClient(program)
  }

  public async prepareDistMint(
    rewardMint: PublicKey,
    distributors: { authority: PublicKey }[],
    governingAuthority?: PublicKey
  ): Promise<PublicKey> {
    if (!governingAuthority) {
      governingAuthority = this.program.provider.wallet.publicKey
    }
    const feePayer = this.program.provider.wallet.publicKey
    const recentBlockhash = (
      await this.program.provider.connection.getRecentBlockhash()
    ).blockhash
    const rewardMintInfo = await mint.get.info(
      this.program.provider.connection,
      rewardMint
    )

    // create mint account
    const distMint = anchor.web3.Keypair.generate()

    const mintTx = await mint.create.tx(
      this.program.provider.connection,
      rewardMintInfo.decimals,
      distMint.publicKey,
      governingAuthority,
      this.program.provider.wallet.publicKey
    )

    const mintPromise = this.program.provider.send(mintTx, [distMint])

    // create all associated token accounts for the distributors
    const createTokenIxs = await Promise.all(
      distributors.map(
        async (d) =>
          associatedTokenAccount.create.maybeInstructions(
            this.program.provider.connection,
            distMint.publicKey,
            d.authority,
            this.program.provider.wallet.publicKey
          ),
        this
      )
    )

    // batch token accounts into multiple txs to not run into tx size limit
    const createTokenIxsPerTx = chunk(
      createTokenIxs.filter((ixs) => ixs.length > 0),
      5
    )
    const createTokenTxs = createTokenIxsPerTx.map((ixsChunk) =>
      new Transaction({ feePayer, recentBlockhash }).add(...ixsChunk.flat(1))
    )

    console.log({ wallet: this.program.provider })

    const sigs: string[] = []

    console.log('wait for mint')
    sigs.push(await mintPromise)

    console.log('then create all tokens')
    sigs.push(
      ...(await Promise.all(
        createTokenTxs.map((tx) => this.program.provider.send(tx), this)
      ))
    )

    console.log('prepareDistMint', distMint.publicKey.toString(), ...sigs)

    return distMint.publicKey
  }

  public async prepareDistMint2(
    rewardMint: PublicKey,
    distributors: { authority: PublicKey }[],
    governingAuthority?: PublicKey
  ): Promise<PublicKey> {
    if (!governingAuthority) {
      governingAuthority = this.program.provider.wallet.publicKey
    }
    const connection = this.program.provider.connection
    const distMintKeypair = anchor.web3.Keypair.generate()
    const distMint = distMintKeypair.publicKey
    const feePayerKeypair = anchor.web3.Keypair.generate()
    const feePayer = feePayerKeypair.publicKey
    const wallet = this.program.provider.wallet.publicKey

    const recentBlockhash = (
      await this.program.provider.connection.getRecentBlockhash()
    ).blockhash
    const rewardMintInfo = await mint.get.info(
      this.program.provider.connection,
      rewardMint
    )

    // create distributor mint
    const mintIxs = await mint.create.instructions(
      connection,
      rewardMintInfo.decimals,
      distMint,
      governingAuthority,
      wallet
    )

    // create all associated token accounts for the distributors
    const createTokenIxs = (
      await Promise.all(
        distributors.map(
          async (d) =>
            associatedTokenAccount.create.maybeInstructions(
              connection,
              distMint,
              d.authority,
              feePayer
            ),
          this
        )
      )
    ).flat()

    // calculate total cost of creating all token accounts
    const [
      rentPerTokenAccount,
      rentForFeePayer,
      feeCalculator,
    ] = await Promise.all([
      Token.getMinBalanceRentForExemptAccount(this.program.provider.connection),
      connection.getMinimumBalanceForRentExemption(0),
      connection.getFeeCalculatorForBlockhash(recentBlockhash),
    ])
    const rentTotal =
      rentPerTokenAccount * createTokenIxs.length + rentForFeePayer
    const chunkSize = 5 // maximum number of assoc token accounts that can be created per TX
    const numInstructions = createTokenIxs.length + 1 // add one instruction to return rentForfeePayer
    const signatureFee =
      feeCalculator.value!.lamportsPerSignature *
      Math.ceil(numInstructions / chunkSize)

    console.log(
      'num accounts',
      distributors.length,
      'num ixs',
      numInstructions,
      'rent tokenAccount',
      rentPerTokenAccount,
      'rent feePayer',
      rentForFeePayer,
      'sig fee',
      signatureFee
    )

    // fund the feePayer with enough lamports to execute all transactions
    const allocFeePayerIx = SystemProgram.transfer({
      fromPubkey: wallet,
      toPubkey: feePayer,
      lamports: rentTotal + signatureFee,
    })

    // return rentForFeePayer to user wallet
    const freeFeePayerIx = SystemProgram.transfer({
      fromPubkey: feePayer,
      toPubkey: wallet,
      lamports: rentForFeePayer,
    })

    // execute first tx signed by user:
    // create mint & alloc feePayer
    const setupTx = new Transaction({ feePayer: wallet, recentBlockhash }).add(
      ...mintIxs, // create mint
      allocFeePayerIx
    )
    const setupSig = await this.program.provider.send(setupTx, [
      distMintKeypair,
    ])
    await untilConfirmed(connection, setupSig)
    console.log('prepareDistMint setup', setupSig)

    // execute all create token instructions in batches signed by the feePayerKeypair
    const backgroundIxs = createTokenIxs.concat([freeFeePayerIx])
    const backgroundTxs = chunk(backgroundIxs, chunkSize).map((ixsChunk) =>
      new Transaction({ feePayer, recentBlockhash }).add(...ixsChunk.flat())
    )
    for (const [index, tx] of backgroundTxs.entries()) {
      const sig = await connection.sendTransaction(tx, [feePayerKeypair])
      await untilConfirmed(connection, sig)
      console.log('prepareDistMint background', index, sig)
    }

    return distMint
  }

  public async mintBudgetInstructions(
    distMint: PublicKey,
    rewardMint: PublicKey,
    distributors: { authority: PublicKey; amount: number }[],
    governingAuthority?: PublicKey
  ): Promise<TransactionInstruction[]> {
    if (!governingAuthority) {
      governingAuthority = this.program.provider.wallet.publicKey
    }

    const rewardMintInfo = await mint.get.info(
      this.program.provider.connection,
      rewardMint
    )

    const ixs = await Promise.all(
      distributors.map(async (d) => {
        const tokenAccount = await associatedTokenAccount.getAssociatedTokenAddress(
          distMint,
          d.authority
        )
        return mint.mintTo.rawInstructions(
          distMint,
          tokenAccount,
          governingAuthority as PublicKey,
          d.amount * Math.pow(10, rewardMintInfo.decimals)
        )
      })
    )

    return ixs.flat(1)
  }

  public async mintBudget(
    distMint: PublicKey,
    rewardMint: PublicKey,
    distributors: { authority: PublicKey; amount: number }[]
  ) {
    const ixs = await this.mintBudgetInstructions(
      distMint,
      rewardMint,
      distributors
    )

    return await this.program.provider.send(new Transaction().add(...ixs))
  }

  public async createDistributorInstruction(
    distMint: PublicKey,
    rewardMint: PublicKey,
    freezeAuthority: PublicKey,
    distEndTs: number,
    redeemStartTs: number
  ): Promise<{ distributor: PublicKey; ix: TransactionInstruction }> {
    const {
      distributorAccount,
      grantMint,
      rewardVault,
      bumps,
    } = await this.deriveDistributorAccounts(distMint, rewardMint)

    console.log(
      'initializeDistributor',
      freezeAuthority.toString(),
      distMint.toString(),
      rewardMint.toString(),
      distributorAccount.toString(),
      grantMint.toString(),
      rewardVault.toString()
    )
    const ix = this.program.instruction.initializeDistributor(
      new anchor.BN(distEndTs),
      new anchor.BN(redeemStartTs),
      bumps,
      {
        accounts: {
          payer: this.program.provider.wallet.publicKey,
          freezeAuthority,
          distMint,
          rewardMint,
          distributorAccount,
          grantMint,
          rewardVault,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    )
    console.debug('createDistributor', distributorAccount.toString(), ix)

    return { distributor: distributorAccount, ix }
  }

  // pass public keys and receive parsed account
  public async createDistributor(
    distMint: PublicKey,
    rewardMint: PublicKey,
    freezeAuthority: PublicKey,
    distEndTs: number,
    redeemStartTs: number
  ): Promise<PublicKey> {
    const {
      distributorAccount,
      grantMint,
      rewardVault,
      bumps,
    } = await this.deriveDistributorAccounts(distMint, rewardMint)

    console.log(
      'initializeDistributor',
      freezeAuthority.toString(),
      distMint.toString(),
      rewardMint.toString(),
      distributorAccount.toString(),
      grantMint.toString(),
      rewardVault.toString()
    )
    const tx = await this.program.rpc.initializeDistributor(
      new anchor.BN(distEndTs),
      new anchor.BN(redeemStartTs),
      bumps,
      {
        accounts: {
          payer: this.program.provider.wallet.publicKey,
          freezeAuthority,
          distMint,
          rewardMint,
          distributorAccount,
          grantMint,
          rewardVault,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    )
    console.debug('createDistributor', distributorAccount.toString(), tx)
    return distributorAccount
  }

  public async assignGrant(
    distMint: PublicKey,
    rewardMint: PublicKey,
    receiverAuthority: PublicKey,
    amount: number,
    memo?: string,
    donor?: anchor.web3.Signer
  ) {
    const donorAuthority = donor
      ? donor.publicKey
      : this.program.provider.wallet.publicKey

    const tx = new Transaction()

    const {
      distributorAccount,
      grantMint,
    } = await this.deriveDistributorAccounts(distMint, rewardMint)
    const { grantAccount, grantBump } = await this.deriveGrantAccount(
      distributorAccount,
      receiverAuthority
    )
    const grantAccountState = await this.program.provider.connection.getAccountInfo(
      grantAccount
    )
    if (grantAccountState == null) {
      console.debug(
        'initializeGrant',
        distributorAccount.toString(),
        grantAccount.toString()
      )

      tx.add(
        await this.program.instruction.initializeGrant(grantBump, {
          accounts: {
            payer: this.program.provider.wallet.publicKey,
            donorAuthority,
            receiverAuthority,
            distributorAccount,
            grantMint,
            grantAccount,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        })
      )
    }

    const donorTokenAccount = await associatedTokenAccount.getAssociatedTokenAddress(
      distMint,
      donorAuthority
    )

    console.debug(
      'transferGrant',
      distributorAccount.toString(),
      grantAccount.toString(),
      donorTokenAccount.toString()
    )
    tx.add(
      await this.program.instruction.transferGrant(
        new anchor.BN(amount),
        grantBump,
        {
          accounts: {
            payer: this.program.provider.wallet.publicKey,
            donorAuthority,
            receiverAuthority,
            distributorAccount,
            distMint,
            distToken: donorTokenAccount,
            grantMint,
            grantAccount,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        }
      )
    )

    if (memo) {
      console.debug('memo', memo)
      tx.add(
        new TransactionInstruction({
          keys: [],
          programId: MEMO_ID,
          data: Buffer.from(memo),
        })
      )
    }

    const signers = donor ? [donor] : []
    const signature = await this.program.provider.send(tx, signers, {
      skipPreflight: true,
    })
    console.log(signature)

    return grantAccount
  }

  public async getGrants(distMint: PublicKey, rewardMint: PublicKey) {
    const { grantMint } = await this.deriveDistributorAccounts(
      distMint,
      rewardMint
    )
    const signatures = await this.program.provider.connection.getConfirmedSignaturesForAddress2(
      grantMint,
      {},
      'confirmed'
    )

    const transactions = await Promise.all(
      signatures.map((s) =>
        this.program.provider.connection.getTransaction(s.signature, {
          commitment: 'confirmed',
        })
      )
    )

    const result: {
      transfer: { from: string; to: string; amount: number }
      memo: string | undefined
      signature: string
      slot: number
    }[] = []
    for (let i = 0; i < signatures.length; i++) {
      const { signature, slot } = signatures[i]
      const t = transactions[i]!
      let assemblyId, memoId

      // @ts-ignore
      const entries = t.transaction.message.indexToProgramIds.entries()
      for (const [k, v] of entries) {
        if (v.equals(anchor.workspace.Assembly.programId)) {
          assemblyId = k
        }
        if (v.equals(MEMO_ID)) {
          memoId = k
        }
      }

      let transfer, memo: string | undefined
      for (const instruction of t.transaction.message.instructions) {
        switch (instruction.programIdIndex) {
          case assemblyId: {
            const parsedIns = this.program.coder.instruction.decode(
              instruction.data,
              'base58'
            )!
            if (parsedIns.name === 'transferGrant') {
              const parsedAccounts = {}
              const idlIns = anchor.workspace.Assembly.idl.instructions.filter(
                (idlIns) => parsedIns.name === idlIns.name
              )[0]
              idlIns.accounts.forEach((acc, ix) => {
                const txIx = instruction.accounts[ix]
                const pk = t.transaction.message.accountKeys[txIx]
                parsedAccounts[acc.name] = pk.toString()
              })
              transfer = {
                from: parsedAccounts['donorAuthority'],
                to: parsedAccounts['receiverAuthority'],
                amount: parsedIns.data['amount'].toNumber(),
              }
            }
            break
          }
          case memoId:
            memo = bs58.decode(instruction.data).toString('utf-8')

            break
        }
      }

      if (transfer) result.push({ signature, slot, transfer, memo })
    }

    return result
  }

  public async redeemGrant(
    distMint: PublicKey,
    rewardMint: PublicKey,
    receiver?: anchor.web3.Signer
  ) {
    const tx = new Transaction()

    const receiverAuthority = receiver
      ? receiver.publicKey
      : this.program.provider.wallet.publicKey
    const receiverTokenAccount = await associatedTokenAccount.getAssociatedTokenAddress(
      rewardMint,
      receiverAuthority
    )
    const receiverTokenAccountState = await this.program.provider.connection.getAccountInfo(
      receiverTokenAccount
    )
    if (receiverTokenAccountState == null) {
      tx.add(
        ...(await associatedTokenAccount.createAssociatedTokenAccountInstructions(
          rewardMint,
          receiverAuthority,
          this.program.provider.wallet.publicKey
        ))
      )
    }

    const {
      distributorAccount,
      grantMint,
      rewardVault,
    } = await this.deriveDistributorAccounts(distMint, rewardMint)
    const { grantAccount, grantBump } = await this.deriveGrantAccount(
      distributorAccount,
      receiverAuthority
    )

    tx.add(
      await this.program.instruction.redeemGrant(grantBump, {
        accounts: {
          payer: this.program.provider.wallet.publicKey,
          receiverAuthority,
          distributorAccount,
          grantMint,
          grantAccount,
          rewardMint,
          rewardVault,
          receiverTokenAccount,
          clock: SYSVAR_CLOCK_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      })
    )

    const signers = receiver ? [receiver] : []
    const signature = await this.program.provider.send(tx, signers, {
      skipPreflight: true,
    })
    return signature
  }

  public async deriveDistributorAccounts(
    distMint: PublicKey,
    rewardMint: PublicKey
  ) {
    console.log('deriveDistributorAccounts', this.program.programId.toString())

    const [
      distributorAccount,
      distributorBump,
    ] = await PublicKey.findProgramAddress(
      [distMint.toBuffer()],
      this.program.programId
    )

    const [grantMint, grantBump] = await PublicKey.findProgramAddress(
      [distributorAccount.toBuffer(), Buffer.from('grant_mint')],
      this.program.programId
    )

    const [rewardVault, rewardBump] = await PublicKey.findProgramAddress(
      [
        distributorAccount.toBuffer(),
        Buffer.from('reward_vault'),
        rewardMint.toBuffer(),
      ],
      this.program.programId
    )

    return {
      distributorAccount,
      grantMint,
      rewardVault,
      bumps: {
        distributorBump,
        grantBump,
        rewardBump,
      },
    }
  }

  public async deriveGrantAccount(distributor: PublicKey, receiver: PublicKey) {
    const [grantAccount, grantBump] = await PublicKey.findProgramAddress(
      [distributor.toBuffer(), Buffer.from('grant'), receiver.toBuffer()],
      this.program.programId
    )
    return {
      grantAccount,
      grantBump,
    }
  }
}
