import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import {
  getSignatoryRecordAddress,
  ProgramAccount,
  Realm,
  VoteType,
  withCreateProposal,
} from '@solana/spl-governance'
import { withAddSignatory } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { withInsertTransaction } from '@solana/spl-governance'
import { InstructionData } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@solana/spl-governance'
import { withUpdateVoterWeightRecord } from 'VoteStakeRegistry/sdk/withUpdateVoterWeightRecord'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { sendTransactions, SequenceType } from '@utils/sendTransactions'
import { chunks } from '@utils/helpers'

export interface InstructionDataWithHoldUpTime {
  data: InstructionData | null
  holdUpTime: number | undefined
  prerequisiteInstructions: TransactionInstruction[]
  chunkSplitByDefault?: boolean
}

export const createProposal = async (
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  instructionsData: InstructionDataWithHoldUpTime[],
  isDraft: boolean,
  client?: VsrClient
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []
  const governanceAuthority = walletPubkey
  const signatory = walletPubkey
  const payer = walletPubkey
  const notificationTitle = isDraft ? 'proposal draft' : 'proposal'
  const prerequisiteInstructions: TransactionInstruction[] = []

  // V2 Approve/Deny configuration
  const voteType = VoteType.SINGLE_CHOICE
  const options = ['Approve']
  const useDenyOption = true

  //will run only if plugin is connected with realm
  const voterWeight = await withUpdateVoterWeightRecord(
    instructions,
    wallet.publicKey!,
    realm,
    client
  )

  const proposalAddress = await withCreateProposal(
    instructions,
    programId,
    programVersion,
    realm.pubkey!,
    governance,
    tokenOwnerRecord,
    name,
    descriptionLink,
    governingTokenMint,
    governanceAuthority,
    proposalIndex,
    voteType,
    options,
    useDenyOption,
    payer,
    voterWeight
  )

  await withAddSignatory(
    instructions,
    programId,
    programVersion,
    proposalAddress,
    tokenOwnerRecord,
    governanceAuthority,
    signatory,
    payer
  )

  // TODO: Return signatoryRecordAddress from the SDK call
  const signatoryRecordAddress = await getSignatoryRecordAddress(
    programId,
    proposalAddress,
    signatory
  )

  const insertInstructions: TransactionInstruction[] = []
  const splitToChunkByDefault = instructionsData.filter(
    (x) => x.chunkSplitByDefault
  ).length

  for (const [index, instruction] of instructionsData
    .filter((x) => x.data)
    .entries()) {
    if (instruction.data) {
      if (instruction.prerequisiteInstructions) {
        prerequisiteInstructions.push(...instruction.prerequisiteInstructions)
      }
      await withInsertTransaction(
        insertInstructions,
        programId,
        programVersion,
        governance,
        proposalAddress,
        tokenOwnerRecord,
        governanceAuthority,
        index,
        0,
        instruction.holdUpTime || 0,
        [instruction.data],
        payer
      )
    }
  }

  const insertInstructionCount = insertInstructions.length

  if (!isDraft) {
    withSignOffProposal(
      insertInstructions, // SingOff proposal needs to be executed after inserting instructions hence we add it to insertInstructions
      programId,
      programVersion,
      realm.pubkey,
      governance,
      proposalAddress,
      signatory,
      signatoryRecordAddress,
      undefined
    )
  }

  // This is an arbitrary threshold and we assume that up to 2 instructions can be inserted as a single Tx
  // This is conservative setting and we might need to revise it if we have more empirical examples or
  // reliable way to determine Tx size
  if (insertInstructionCount <= 2 && !splitToChunkByDefault) {
    const transaction = new Transaction()
    // We merge instructions with prerequisiteInstructions
    // Prerequisite  instructions can came from instructions as something we need to do before instruction can be executed
    // For example we create ATAs if they don't exist as part of the proposal creation flow
    transaction.add(
      ...prerequisiteInstructions,
      ...instructions,
      ...insertInstructions
    )

    await sendTransaction({
      transaction,
      wallet,
      connection,
      signers,
      sendingMessage: `creating ${notificationTitle}`,
      successMessage: `${notificationTitle} created`,
    })
  } else {
    const insertChunks = chunks(insertInstructions, 2)
    const signerChunks = Array(insertChunks.length).fill([])

    console.log(`Creating proposal using ${insertChunks.length} chunks`)

    await sendTransactions(
      connection,
      wallet,
      [prerequisiteInstructions, instructions, ...insertChunks],
      [[], [], ...signerChunks],
      SequenceType.Sequential
    )
  }

  return proposalAddress
}
