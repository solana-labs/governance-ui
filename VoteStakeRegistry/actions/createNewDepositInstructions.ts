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
  LockupKinds,
  tryGetVoter,
} from 'VoteStakeRegistry/utils/voteRegistryTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'

export const createNewDepositInstructions = async ({
  rpcContext,
  mint,
  realmPk,
  programId,
  hasTokenOwnerRecord,
  lockUpPeriodInDays = 0,
  lockupKind = 'none',
  //force create new means that new deposit will be created regardless of other conditions
  forceCreateNew = false,
  client,
}: {
  rpcContext: RpcContext
  //e.g council or community
  mint: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  hasTokenOwnerRecord: boolean
  lockUpPeriodInDays?: number
  lockupKind?: LockupKinds
  forceCreateNew?: boolean
  client?: VsrClient
}) => {
  const { wallet } = rpcContext
  if (!client) {
    throw 'no vote registry plugin'
  }
  if (!wallet.publicKey) {
    throw 'no wallet connected'
  }
  const systemProgram = SystemProgram.programId
  const instructions: TransactionInstruction[] = []
  const clientProgramId = client!.program.programId
  let tokenOwnerRecordPubKey: PublicKey | null = null

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
    tokenOwnerRecordPubKey = await withCreateTokenOwnerRecord(
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
    const oneMonthDays = 30.4368499
    const period =
      lockupKind !== 'monthly'
        ? lockUpPeriodInDays
        : lockUpPeriodInDays / oneMonthDays
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
          depositMint: mint,
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

  //   const close = client.program.instruction.closeDepositEntry(2, {
  //     accounts: {
  //       voter: voter,
  //       voterAuthority: wallet.publicKey,
  //     },
  //   })
  //   instructions.push(close)

  const depositIdx =
    isExistingDepositEntry && !forceCreateNew
      ? indexOfExistingDeposit!
      : firstFreeIdx

  return {
    instructions,
    depositIdx,
    registrar,
    voterATAPk,
    voter,
    tokenOwnerRecordPubKey,
    voterWeight,
  }
}
