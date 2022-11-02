import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'

import {
  getGovernanceProgramVersion,
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  Realm,
  TokenOwnerRecord,
  VoteType,
  withCreateProposal,
  getSignatoryRecordAddress,
} from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { withInsertTransaction } from '@solana/spl-governance'
import { InstructionData } from '@solana/spl-governance'
import { withSignOffProposal } from '@solana/spl-governance'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { chunks } from '@utils/helpers'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { NftVoterClient } from '@solana/governance-program-library'
import { withAddSignatory } from '@solana/spl-governance'

export interface InstructionDataWithHoldUpTime {
  data: InstructionData | null
  holdUpTime: number | undefined
  prerequisiteInstructions: TransactionInstruction[]
  chunkSplitByDefault?: boolean
  chunkBy?: number
  signers?: Keypair[]
  shouldSplitIntoSeparateTxs?: boolean | undefined
  prerequisiteInstructionsSigners?: Keypair[]
}

export class InstructionDataWithHoldUpTime {
  constructor({
    instruction,
    governance,
  }: {
    instruction: UiInstruction
    governance?: ProgramAccount<Governance>
  }) {
    this.data = instruction.serializedInstruction
      ? getInstructionDataFromBase64(instruction.serializedInstruction)
      : null
    this.holdUpTime =
      typeof instruction.customHoldUpTime !== 'undefined'
        ? instruction.customHoldUpTime
        : governance?.account?.config.minInstructionHoldUpTime
    this.prerequisiteInstructions = instruction.prerequisiteInstructions || []
    this.chunkSplitByDefault = instruction.chunkSplitByDefault || false
    this.chunkBy = instruction.chunkBy || 2
    this.prerequisiteInstructionsSigners =
      instruction.prerequisiteInstructionsSigners || []
  }
}

export const createProposal = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  governance: PublicKey,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  instructionsData: InstructionDataWithHoldUpTime[],
  isDraft: boolean,
  client?: VotingClient
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const signatory = walletPubkey
  const payer = walletPubkey
  const prerequisiteInstructions: TransactionInstruction[] = []
  const prerequisiteInstructionsSigners: Keypair[] = []
  // sum up signers
  const signers: Keypair[] = instructionsData.flatMap((x) => x.signers ?? [])
  const shouldSplitIntoSeparateTxs: boolean = instructionsData
    .flatMap((x) => x.shouldSplitIntoSeparateTxs)
    .some((x) => x)

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo

  // Changed this because it is misbehaving on my local validator setup.
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  // V2 Approve/Deny configuration
  const voteType = VoteType.SINGLE_CHOICE
  const options = ['Approve']
  const useDenyOption = true

  //will run only if plugin is connected with realm
  const plugin = await client?.withUpdateVoterWeightRecord(
    instructions,
    tokenOwnerRecord,
    'createProposal',
    governance
  )

  const proposalAddress = await withCreateProposal(
    instructions,
    programId,
    programVersion,
    realm.pubkey!,
    governance,
    tokenOwnerRecord.pubkey,
    name,
    descriptionLink,
    governingTokenMint,
    governanceAuthority,
    proposalIndex,
    voteType,
    options,
    useDenyOption,
    payer,
    plugin?.voterWeightPk
  )

  await withAddSignatory(
    instructions,
    programId,
    programVersion,
    proposalAddress,
    tokenOwnerRecord.pubkey,
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

  const chunkBys = instructionsData
    .filter((x) => x.chunkBy)
    .map((x) => x.chunkBy!)
  const chunkBy = chunkBys.length ? Math.min(...chunkBys) : 2
  for (const [index, instruction] of instructionsData
    .filter((x) => x.data)
    .entries()) {
    if (instruction.data) {
      if (instruction.prerequisiteInstructions) {
        prerequisiteInstructions.push(...instruction.prerequisiteInstructions)
      }
      if (instruction.prerequisiteInstructionsSigners) {
        prerequisiteInstructionsSigners.push(
          ...instruction.prerequisiteInstructionsSigners
        )
      }
      await withInsertTransaction(
        insertInstructions,
        programId,
        programVersion,
        governance,
        proposalAddress,
        tokenOwnerRecord.pubkey,
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
  if (
    insertInstructionCount <= 2 &&
    !shouldSplitIntoSeparateTxs &&
    !splitToChunkByDefault &&
    !(client?.client instanceof NftVoterClient)
  ) {
    // This is an arbitrary threshold and we assume that up to 2 instructions can be inserted as a single Tx
    // This is conservative setting and we might need to revise it if we have more empirical examples or
    // reliable way to determine Tx size
    // We merge instructions with prerequisiteInstructions
    // Prerequisite  instructions can came from instructions as something we need to do before instruction can be executed
    // For example we create ATAs if they don't exist as part of the proposal creation flow
    const signersSet = [[], [], signers]
    const txes = [
      prerequisiteInstructions,
      instructions,
      insertInstructions,
    ].map((txBatch, batchIdx) => {
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(
          txBatch,
          signersSet,
          batchIdx
        ),
        sequenceType: SequenceType.Sequential,
      }
    })

    await sendTransactionsV3({
      connection,
      wallet,
      transactionInstructions: txes,
    })
  } else {
    const insertChunks = chunks(insertInstructions, chunkBy)
    const signerChunks = Array(insertChunks.length)
    signerChunks.push(...chunks(signers, chunkBy))
    signerChunks.fill([])
    const deduplicatedPrerequisiteInstructions = prerequisiteInstructions.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.data.toString() === value.data.toString() &&
            t.keys.every((x) =>
              value.keys.find(
                (key) => key.pubkey.toBase58() === x.pubkey.toBase58()
              )
            )
        )
    )

    const signersSet = [
      ...chunks([...prerequisiteInstructionsSigners], 5),
      [],
      ...signerChunks,
    ]
    const txes = [
      ...chunks(deduplicatedPrerequisiteInstructions, 5),
      instructions,
      ...insertChunks,
    ].map((txBatch, batchIdx) => {
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(
          txBatch,
          signersSet,
          batchIdx
        ),
        sequenceType: SequenceType.Sequential,
      }
    })

    await sendTransactionsV3({
      connection,
      wallet,
      transactionInstructions: txes,
    })
  }

  return proposalAddress
}
