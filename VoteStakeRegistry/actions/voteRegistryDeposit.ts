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
  getMintCfgIdx,
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
  tryGetVoter,
} from 'VoteStakeRegistry/utils/voteRegistryTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'

export const voteRegistryDeposit = async (
  { connection, wallet }: RpcContext,
  //from where we deposit our founds
  fromPk: PublicKey,
  //e.g council or community
  mint: PublicKey,
  realmPk: PublicKey,
  programId: PublicKey,
  amount: BN,
  hasTokenOwnerRecord: boolean,
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
    realmPk,
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

  if (!hasTokenOwnerRecord) {
    //do we need await here ?
    await withCreateTokenOwnerRecord(
      instructions,
      programId,
      realmPk,
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
  const mintCfgIdx = await getMintCfgIdx(registrar, mint, client)
  const indexOfDepositEntryWithTypeNone = existingVoter?.deposits.findIndex(
    (x) =>
      x.isUsed &&
      typeof x.lockup.kind.none !== 'undefined' &&
      x.votingMintConfigIdx === mintCfgIdx
  )
  const isExistingDepositEntry = indexOfDepositEntryWithTypeNone !== -1
  //TODO what if we have more grants then we have indexes
  const firstFreeIdx = (existingVoter?.deposits as Deposit[]).findIndex(
    (x) => !x.isUsed
  )

  if (!isExistingDepositEntry) {
    const lockUpPeriodInSeconds = 0
    const allowClawback = false
    const startTime = new BN(new Date().getTime())
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
    ? indexOfDepositEntryWithTypeNone!
    : firstFreeIdx

  instructions.push(
    client?.program.instruction.deposit(depositIdx, amount, {
      accounts: {
        registrar: registrar,
        voter: voter,
        vault: voterATAPk,
        depositToken: fromPk,
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
