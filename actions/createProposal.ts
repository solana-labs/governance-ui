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
  RpcContext,
  withInsertTransaction,
  InstructionData,
  withSignOffProposal,
  withAddSignatory,
  MultiChoiceType
} from '@solana/spl-governance'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { chunks } from '@utils/helpers'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { trySentryLog } from '@utils/logs'
import { deduplicateObjsFilter } from '@utils/instructionTools'
export interface InstructionDataWithHoldUpTime {
  data: InstructionData | null
  holdUpTime: number | undefined
  prerequisiteInstructions: TransactionInstruction[]
  chunkBy?: number
  signers?: Keypair[]
  prerequisiteInstructionsSigners?: (Keypair | null)[]
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
  isMulti: boolean,
  options: string[],
  client?: VotingClient,
  callbacks?: Parameters<typeof sendTransactionsV3>[0]['callbacks']
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const governanceAuthority = walletPubkey
  const signatory = walletPubkey
  const payer = walletPubkey
  const prerequisiteInstructions: TransactionInstruction[] = []
  const prerequisiteInstructionsSigners: (Keypair | null)[] = []
  // sum up signers
  const signers: Keypair[] = instructionsData.flatMap((x) => x.signers ?? [])

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo

  // Changed this because it is misbehaving on my local validator setup.
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  // V2 Approve/Deny configuration
  const voteType = isMulti ? VoteType.MULTI_CHOICE(
    MultiChoiceType.FullWeight, 1, options.length, options.length
  ) : VoteType.SINGLE_CHOICE
  
  const useDenyOption = !isMulti

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

  const chunkBys = instructionsData
    .filter((x) => x.chunkBy)
    .map((x) => x.chunkBy!)

  const lowestChunkBy = chunkBys.length ? Math.min(...chunkBys) : 2

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

  const insertChunks = chunks(insertInstructions, lowestChunkBy)
  const signerChunks = Array(insertChunks.length)

  signerChunks.push(...chunks(signers, lowestChunkBy))
  signerChunks.fill([])

  const deduplicatedPrerequisiteInstructions = prerequisiteInstructions.filter(
    deduplicateObjsFilter
  )

  const deduplicatedPrerequisiteInstructionsSigners = prerequisiteInstructionsSigners.filter(
    deduplicateObjsFilter
  )

  const prerequisiteInstructionsChunks = chunks(
    deduplicatedPrerequisiteInstructions,
    lowestChunkBy
  )

  const prerequisiteInstructionsSignersChunks = chunks(
    deduplicatedPrerequisiteInstructionsSigners,
    lowestChunkBy
  ).filter((keypairArray) => keypairArray.filter((keypair) => keypair))

  const signersSet = [
    ...prerequisiteInstructionsSignersChunks,
    [],
    ...signerChunks,
  ]

  const txes = [
    ...prerequisiteInstructionsChunks,
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
    callbacks,
    connection,
    wallet,
    transactionInstructions: txes,
  })

  const logInfo = {
    realmId: realm.pubkey.toBase58(),
    realmSymbol: realm.account.name,
    wallet: wallet.publicKey?.toBase58(),
    proposalAddress: proposalAddress.toBase58(),
    proposalIndex: proposalIndex,
    cluster: connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet',
  }
  trySentryLog({
    tag: 'proposalCreated',
    objToStringify: logInfo,
  })
  return proposalAddress
}
