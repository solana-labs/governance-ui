import {
  AddressLookupTableProgram,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  getGovernanceProgramVersion,
  ProgramAccount,
  Realm,
  TokenOwnerRecord,
  VoteType,
  withCreateProposal,
  getSignatoryRecordAddress,
  withInsertTransaction,
  withSignOffProposal,
  withAddSignatory,
  RpcContext,
} from '@solana/spl-governance'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { chunks } from '@utils/helpers'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { trySentryLog } from '@utils/logs'
import { deduplicateObjsFilter } from '@utils/instructionTools'
import { sendSignAndConfirmTransactions } from '@utils/modifiedMangolana'
import { InstructionDataWithHoldUpTime } from './createProposal'

/** This is a modified version of createProposal that makes a lookup table, which is useful for especially large instructions */
// TODO make a more generic, less redundant solution
export const createLUTProposal = async (
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
  options: string[],
  client?: VotingClient,
  callbacks?: Parameters<typeof sendTransactionsV3>[0]['callbacks']
): Promise<PublicKey> => {
  // Assumption:
  // `payer` is a valid `Keypair` with enough SOL to pay for the execution

  const payer = walletPubkey

  const instructions: TransactionInstruction[] = []
  const governanceAuthority = walletPubkey
  const signatory = walletPubkey
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
  const voteType = VoteType.SINGLE_CHOICE
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

  const signersSet = [
    ...chunks([...deduplicatedPrerequisiteInstructionsSigners], lowestChunkBy),
    [],
    ...signerChunks,
  ]

  const txes = [
    ...chunks(deduplicatedPrerequisiteInstructions, lowestChunkBy),
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

  const keys = txes
    .map((x) =>
      x.instructionsSet.map((y) =>
        y.transactionInstruction.keys.map((z) => z.pubkey)
      )
    )
    .flat()
    .flat()
  const slot = await connection.getSlot()

  const [
    lookupTableInst,
    lookupTableAddress,
  ] = AddressLookupTableProgram.createLookupTable({
    authority: payer,
    payer: payer,
    recentSlot: slot,
  })

  // add addresses to the `lookupTableAddress` table via an `extend` instruction
  // need to split into multiple instructions because of the ~20 address limit
  // https://docs.solana.com/developing/lookup-tables#:~:text=NOTE%3A%20Due%20to,transaction%27s%20memory%20limits.
  // const extendInstruction = AddressLookupTableProgram.extendLookupTable({
  //   payer: payer,
  //   authority: payer,
  //   lookupTable: lookupTableAddress,
  //   addresses: keys,
  // })
  const extendInstructions = chunks(keys, 15).map((chunk) =>
    AddressLookupTableProgram.extendLookupTable({
      payer: payer,
      authority: payer,
      lookupTable: lookupTableAddress,
      addresses: chunk,
    })
  )

  // Send this `extendInstruction` in a transaction to the cluster
  // to insert the listing of `addresses` into your lookup table with address `lookupTableAddress`

  console.log('lookup table address:', lookupTableAddress.toBase58())

  let resolve = undefined
  const promise = new Promise((r) => {
    //@ts-ignore
    resolve = r
  })

  // TODO merge all into one call of sendSignAndConfirmTransactions, so the user only signs once
  await sendSignAndConfirmTransactions({
    connection,
    wallet,
    transactionInstructions: [
      {
        instructionsSet: [{ transactionInstruction: lookupTableInst }],
        sequenceType: SequenceType.Sequential,
      },
      ...extendInstructions.map((x) => {
        return {
          instructionsSet: [{ transactionInstruction: x }],
          sequenceType: SequenceType.Sequential,
        }
      }),
    ],
    callbacks: {
      afterAllTxConfirmed: resolve,
    },
  })
  await promise

  const lookupTableAccount = await connection
    .getAddressLookupTable(lookupTableAddress, { commitment: 'singleGossip' })
    .then((res) => res.value)
  if (lookupTableAccount === null) throw new Error()

  await sendTransactionsV3({
    callbacks,
    connection,
    wallet,
    transactionInstructions: txes,
    lookupTableAccounts: [lookupTableAccount],
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
