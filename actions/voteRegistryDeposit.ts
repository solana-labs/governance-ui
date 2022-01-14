import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { withCreateTokenOwnerRecord } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from '@project-serum/anchor'
import {
  Deposit,
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
  tryGetVoter,
} from '@utils/voteRegistryTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'

export const voteRegistryDeposit = async (
  { connection, wallet }: RpcContext,
  //from where we deposit our founds
  fromPubKey: PublicKey,
  //e.g council or community
  mint: PublicKey,
  realmPubKey: PublicKey,
  realmOwner: PublicKey,
  amount: BN,
  hasTokenRecordInsideSPL: boolean,
  client?: VsrClient
) => {
  if (!client) {
    throw 'no vote registry plugin'
  }
  if (!wallet.publicKey) {
    throw 'no wallet connected'
  }
  const systemProgram = SystemProgram.programId
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []
  const clientProgramId = client!.program.programId

  const { registrar } = await getRegistrarPDA(
    realmPubKey,
    mint,
    client!.program.programId
  )
  const { voter, voterBump } = await getVoterPDA(
    registrar,
    wallet!.publicKey!,
    clientProgramId
  )
  const { voterWeight, voterWeightBump } = await getVoterWeightPDA(
    registrar,
    wallet!.publicKey!,
    clientProgramId
  )
  const existingVoter = await tryGetVoter(voter, client)

  const voterATAPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
    TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
    mint,
    voter
  )

  if (!hasTokenRecordInsideSPL) {
    //do we need await here ?
    await withCreateTokenOwnerRecord(
      instructions,
      realmOwner,
      realmPubKey,
      wallet!.publicKey!,
      mint,
      wallet!.publicKey!
    )
  }
  if (!existingVoter) {
    instructions.push(
      client?.program.instruction.createVoter(voterBump, voterWeightBump, {
        accounts: {
          registrar: registrar,
          voter: voter,
          voterAuthority: wallet!.publicKey!,
          voterWeightRecord: voterWeight,
          payer: wallet!.publicKey!,
          systemProgram: systemProgram,
          rent: SYSVAR_RENT_PUBKEY,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
      })
    )
  }
  //TODO Check mint of deposit ?
  const indexOfDepositEntryWithTypeNone = (existingVoter?.deposits as Deposit[]).findIndex(
    (x) => x.isUsed && typeof x.lockup.kind.none !== 'undefined'
  )
  const isExistingDepositEntry = indexOfDepositEntryWithTypeNone !== -1
  const firstFreeIdx = (existingVoter?.deposits as Deposit[]).findIndex(
    (x) => !x.isUsed
  )

  if (!isExistingDepositEntry) {
    const lockUpPeriodInSeconds = 0
    const allowClawback = false
    const startTime = new BN(new Date().getTime())
    //TODO are we sure ata is created here and we dont need to init it ?
    instructions.push(
      client?.program.instruction.createDepositEntry(
        firstFreeIdx,
        { none: {} },
        startTime,
        lockUpPeriodInSeconds,
        allowClawback,
        {
          accounts: {
            registrar: registrar,
            voter: voter,
            payer: wallet!.publicKey!,
            voterAuthority: wallet!.publicKey!,
            depositMint: mint,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: systemProgram,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            vault: voterATAPk,
          },
        }
      )
    )
  }

  const depositIdx = isExistingDepositEntry
    ? indexOfDepositEntryWithTypeNone
    : firstFreeIdx
  instructions.push(
    client?.program.instruction.deposit(depositIdx, amount, {
      accounts: {
        registrar: registrar,
        voter: voter,
        vault: voterATAPk,
        depositToken: fromPubKey,
        depositAuthority: wallet!.publicKey!,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: `Depositing`,
    successMessage: `Deposit successful`,
  })
}
