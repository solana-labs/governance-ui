import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import BN from 'bn.js'
import { DepositTx, Pool } from '@everlend/general-pool'
import { GeneralPoolsProgram } from '@everlend/general-pool'
import {
  CreateAssociatedTokenAccount,
  findAssociatedTokenAccount,
  findRegistryPoolConfigAccount,
} from '@everlend/common'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { syncNative } from '@solendprotocol/solend-sdk'

export type ActionOptions = {
  /** the JSON RPC connection instance. */
  connection: Connection
  /** the fee payer public key, can be user's SOL address (owner address). */
  payerPublicKey: PublicKey
}

export type ActionResult = {
  /** the prepared transaction, ready for signing and sending. */
  tx: Transaction
  /** the additional key pairs which may be needed for signing and sending transactions. */
  keypairs?: Record<string, Keypair>
}

export const prepareSolDepositTx = async (
  { connection, payerPublicKey }: ActionOptions,
  pool: PublicKey,
  registry: PublicKey,
  amount: BN,
  source: PublicKey,
  destination: PublicKey
): Promise<ActionResult> => {
  const {
    data: { poolMarket, tokenAccount, poolMint, tokenMint },
  } = await Pool.load(connection, pool)

  const poolMarketAuthority = await GeneralPoolsProgram.findProgramAddress([
    poolMarket.toBuffer(),
  ])

  const tx = new Transaction()
  const registryPoolConfig = await findRegistryPoolConfigAccount(registry, pool)

  console.log('source (ctoken)', source.toString())
  console.log('dest (liquidity)', destination.toString())

  // Wrapping SOL
  const depositAccountInfo = await connection.getAccountInfo(source)
  console.log({ depositAccountInfo })
  if (!depositAccountInfo) {
    // generate the instruction for creating the ATA
    const createAtaInst = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(tokenMint),
      source,
      payerPublicKey,
      payerPublicKey
    )
    tx.add(createAtaInst)
  }

  const userWSOLAccountInfo = await connection.getAccountInfo(destination)

  const rentExempt = await Token.getMinBalanceRentForExemptAccount(connection)

  const transferLamportsIx = SystemProgram.transfer({
    fromPubkey: payerPublicKey,
    toPubkey: source,
    lamports: (userWSOLAccountInfo ? 0 : rentExempt) + amount.toNumber(),
  })

  tx.add(transferLamportsIx)

  if (!userWSOLAccountInfo) {
    const createUserWSOLAccountIx = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      NATIVE_MINT,
      source,
      payerPublicKey,
      payerPublicKey
    )
    tx.add(createUserWSOLAccountIx)
  } else {
    const syncIx = syncNative(source)
    tx.add(syncIx)
  }

  // Create destination account for pool mint if doesn't exist
  destination =
    destination ?? (await findAssociatedTokenAccount(payerPublicKey, poolMint))
  !(await connection.getAccountInfo(destination)) &&
    tx.add(
      new CreateAssociatedTokenAccount(
        { feePayer: payerPublicKey },
        {
          associatedTokenAddress: destination,
          tokenMint: poolMint,
        }
      )
    )

  tx.add(
    new DepositTx(
      { feePayer: payerPublicKey },
      {
        registryPoolConfig,
        registry,
        poolMarket,
        pool,
        source,
        destination,
        tokenAccount,
        poolMint,
        poolMarketAuthority,
        amount,
      }
    )
  )

  return { tx }
}
