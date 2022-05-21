import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import {
  getGovernanceProgramVersion,
  getInstructionDataFromBase64,
  getSignatoryRecordAddress,
  Governance,
  ProgramAccount,
  Realm,
  TokenOwnerRecord,
  VoteType,
  withCreateProposal,
} from '@solana/spl-governance'
import { withAddSignatory } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { withInsertTransaction } from '@solana/spl-governance'
import { InstructionData } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@solana/spl-governance'
import {
  sendTransactionsV2,
  SequenceType,
  transactionInstructionsToTypedInstructionsSets,
} from '@utils/sendTransactions'
import { chunks } from '@utils/helpers'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { NftVoterClient } from '@solana/governance-program-library'

export interface InstructionDataWithHoldUpTime {
  data: InstructionData | null
  holdUpTime: number | undefined
  prerequisiteInstructions: TransactionInstruction[]
  chunkSplitByDefault?: boolean
  signers?: Keypair[]
  shouldSplitIntoSeparateTxs?: boolean | undefined
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
      typeof instruction.customHoldUpTime !== undefined
        ? instruction.customHoldUpTime
        : governance?.account?.config.minInstructionHoldUpTime

    this.prerequisiteInstructions = instruction.prerequisiteInstructions || []
    this.chunkSplitByDefault = instruction.chunkSplitByDefault || false
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
  const notificationTitle = isDraft ? 'proposal draft' : 'proposal'
  const prerequisiteInstructions: TransactionInstruction[] = []

  // sum up signers
  const signers: Keypair[] = instructionsData.flatMap((x) => x.signers ?? [])
  const shouldSplitIntoSeparateTxs: boolean = instructionsData
    .flatMap((x) => x.shouldSplitIntoSeparateTxs)
    .some((x) => x)

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
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
    'createProposal'
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

  if (shouldSplitIntoSeparateTxs) {
    const transaction1 = new Transaction()
    const transaction2 = new Transaction()

    transaction1.add(...prerequisiteInstructions, ...instructions)
    transaction2.add(...insertInstructions)

    await sendTransaction({
      transaction: transaction1,
      wallet,
      connection,
      signers,
      sendingMessage: `creating ${notificationTitle}`,
      successMessage: `${notificationTitle} created`,
    })

    await sendTransaction({
      transaction: transaction2,
      wallet,
      connection,
      signers: undefined,
      sendingMessage: `inserting into ${notificationTitle}`,
      successMessage: `inserted into ${notificationTitle}`,
    })
  } else if (
    insertInstructionCount <= 2 &&
    !splitToChunkByDefault &&
    !(client?.client instanceof NftVoterClient)
  ) {
    // This is an arbitrary threshold and we assume that up to 2 instructions can be inserted as a single Tx
    // This is conservative setting and we might need to revise it if we have more empirical examples or
    // reliable way to determine Tx size
    // We merge instructions with prerequisiteInstructions
    // Prerequisite  instructions can came from instructions as something we need to do before instruction can be executed
    // For example we create ATAs if they don't exist as part of the proposal creation flow

    await sendTransactionsV2({
      wallet,
      connection,
      signersSet: [[], [], signers],
      showUiComponent: true,
      TransactionInstructions: [
        prerequisiteInstructions,
        instructions,
        insertInstructions,
      ].map((x) =>
        transactionInstructionsToTypedInstructionsSets(
          x,
          SequenceType.Sequential
        )
      ),
    })
  } else {
    const insertChunks = chunks(insertInstructions, 2)
    const signerChunks = Array(insertChunks.length).fill([])

    console.log(`Creating proposal using ${insertChunks.length} chunks`)
    await sendTransactionsV2({
      wallet,
      connection,
      signersSet: [[], [], ...signerChunks],
      showUiComponent: true,
      TransactionInstructions: [
        prerequisiteInstructions,
        instructions,
        ...insertChunks,
      ].map((x) =>
        transactionInstructionsToTypedInstructionsSets(
          x,
          SequenceType.Sequential
        )
      ),
    })
  }

  return proposalAddress
}
