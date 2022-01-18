import {
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { withCreateTokenOwnerRecord } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from '@project-serum/anchor'
import {
  getMintCfgIdx,
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
  LockupType,
  tryGetVoter,
} from 'VoteStakeRegistry/utils/voteRegistryTools'
import { DAYS_PER_MONTH } from 'VoteStakeRegistry/utils/dateTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'

export const withCreateNewDepositInstructions = async ({
  instructions,
  rpcContext,
  mintPk,
  realmPk,
  programId,
  tokenOwnerRecordPk,
  lockUpPeriodInDays,
  lockupKind,
  forceCreateNew = false,
  client,
}: {
  instructions: TransactionInstruction[]
  rpcContext: RpcContext
  mintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  tokenOwnerRecordPk: PublicKey | null
  lockUpPeriodInDays: number
  lockupKind: LockupType
  //force create new means that new deposit will be created regardless of other conditions
  forceCreateNew?: boolean
  client?: VsrClient
}) => {
  const { wallet } = rpcContext
  if (!client) {
    throw 'no vote registry plugin'
  }
  const systemProgram = SystemProgram.programId
  const clientProgramId = client!.program.programId
  let tokenOwnerRecordPubKey = tokenOwnerRecordPk

  const { registrar } = await getRegistrarPDA(
    realmPk,
    mintPk,
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
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintPk,
    voter
  )

  //spl governance tokenownerrecord pubkey
  if (!tokenOwnerRecordPubKey) {
    tokenOwnerRecordPubKey = await withCreateTokenOwnerRecord(
      instructions,
      programId,
      realmPk,
      wallet!.publicKey!,
      mintPk,
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
  const mintCfgIdx = await getMintCfgIdx(registrar, mintPk, client)
  const indexOfExistingDeposit = existingVoter?.deposits.findIndex(
    (x) =>
      x.isUsed &&
      typeof x.lockup.kind[lockupKind] !== 'undefined' &&
      x.votingMintConfigIdx === mintCfgIdx
  )
  const isExistingDepositEntry =
    typeof indexOfExistingDeposit !== 'undefined' &&
    indexOfExistingDeposit !== -1

  const firstFreeIdx = existingVoter?.deposits?.findIndex((x) => !x.isUsed) || 0

  if (firstFreeIdx === -1) {
    throw 'You have to much active deposits'
  }

  if (!isExistingDepositEntry || forceCreateNew) {
    //in case we do monthly close up we pass months not days.
    const period =
      lockupKind !== 'monthly'
        ? lockUpPeriodInDays
        : lockUpPeriodInDays / DAYS_PER_MONTH
    const roundedPeriod = Math.round(period)
    const allowClawback = false
    const startTime = new BN(new Date().getTime())
    const createDepositEntryInstruction = client?.program.instruction.createDepositEntry(
      firstFreeIdx,
      { [lockupKind]: {} },
      startTime,
      roundedPeriod,
      allowClawback,
      {
        accounts: {
          registrar: registrar,
          voter: voter,
          payer: wallet!.publicKey!,
          voterAuthority: wallet!.publicKey!,
          depositMint: mintPk,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: systemProgram,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          vault: voterATAPk,
        },
      }
    )
    instructions.push(createDepositEntryInstruction)
  }

  const depositIdx =
    isExistingDepositEntry && !forceCreateNew
      ? indexOfExistingDeposit!
      : firstFreeIdx

  return {
    depositIdx,
    registrar,
    voterATAPk,
    voter,
    tokenOwnerRecordPubKey,
    voterWeight,
  }
}
