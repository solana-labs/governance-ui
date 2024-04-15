import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { withCreateTokenOwnerRecord } from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
  LockupType,
} from 'VoteStakeRegistry/sdk/accounts'
import { getMintCfgIdx, tryGetVoter } from './api'
import { getPeriod } from 'VoteStakeRegistry/tools/deposits'
import { VsrClient } from './client'

export const withCreateNewDeposit = async ({
  instructions,
  walletPk,
  mintPk,
  communityMintPk,
  realmPk,
  programId,
  programVersion,
  tokenOwnerRecordPk,
  lockUpPeriodInDays,
  lockupKind,
  client,
  allowClawback = false,
}: {
  instructions: TransactionInstruction[]
  walletPk: PublicKey
  mintPk: PublicKey
  communityMintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  programVersion: number
  tokenOwnerRecordPk: PublicKey | null
  lockUpPeriodInDays: number
  lockupKind: LockupType
  allowClawback?: boolean
  client?: VsrClient
}) => {
  if (!client) {
    throw 'no vote registry plugin'
  }
  const systemProgram = SystemProgram.programId
  const clientProgramId = client!.program.programId
  let tokenOwnerRecordPubKey = tokenOwnerRecordPk

  const { registrar } = getRegistrarPDA(
    realmPk,
    communityMintPk,
    clientProgramId
  )
  const { voter } = getVoterPDA(
    registrar,
    walletPk,
    clientProgramId
  )
  const { voterWeightPk } = getVoterWeightPDA(
    registrar,
    walletPk,
    clientProgramId
  )
  const existingVoter = await tryGetVoter(voter, client)

  const voterATAPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintPk,
    voter,
    true
  )

  //spl governance tokenownerrecord pubkey
  if (!tokenOwnerRecordPubKey) {
    tokenOwnerRecordPubKey = await withCreateTokenOwnerRecord(
      instructions,
      programId,
      programVersion,
      realmPk,
      walletPk,
      communityMintPk,
      walletPk
    )
  }

  if (!existingVoter) {
    const createVoterIx = await client?.createVoterWeightRecord(walletPk, realmPk, communityMintPk)
    instructions.push(createVoterIx)
  }
  const mintCfgIdx = await getMintCfgIdx(registrar, mintPk, client)

  //none type deposits are used only to store tokens that will be withdrawable immediately so there is no need to create new every time and there should be one per mint
  //for other kinds of deposits we always want to create new deposit
  const indexOfNoneTypeDeposit =
    lockupKind === 'none'
      ? existingVoter?.deposits.findIndex(
          (x) =>
            x.isUsed &&
            typeof x.lockup.kind[lockupKind] !== 'undefined' &&
            x.votingMintConfigIdx === mintCfgIdx
        )
      : -1

  const createNewDeposit =
    typeof indexOfNoneTypeDeposit === 'undefined' ||
    indexOfNoneTypeDeposit === -1

  const firstFreeIdx = existingVoter?.deposits?.findIndex((x) => !x.isUsed) || 0

  if (firstFreeIdx === -1 && createNewDeposit) {
    throw 'User has to much active deposits'
  }

  if (createNewDeposit) {
    //in case we do monthly close up we pass months not days.
    const period = getPeriod(lockUpPeriodInDays, lockupKind)
    const createDepositEntryInstruction = await client?.program.methods
      .createDepositEntry(
        firstFreeIdx,
        { [lockupKind]: {} } as any, // The cast to any works around an anchor issue with interpreting enums
        //lockup starts now
        null,
        period,
        allowClawback
      )
      .accounts({
        registrar: registrar,
        voter: voter,
        payer: walletPk,
        voterAuthority: walletPk,
        depositMint: mintPk,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: systemProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        vault: voterATAPk,
      })
      .instruction()
    instructions.push(createDepositEntryInstruction)
  }

  const depositIdx = !createNewDeposit ? indexOfNoneTypeDeposit! : firstFreeIdx
  return {
    depositIdx,
    registrar,
    voterATAPk,
    voter,
    tokenOwnerRecordPubKey,
    voterWeightPk,
  }
}
