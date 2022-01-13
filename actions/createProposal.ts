import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import {
  getSignatoryRecordAddress,
  VoteType,
  withCreateProposal,
} from '@solana/spl-governance'
import { withAddSignatory } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { withInsertInstruction } from '@solana/spl-governance'
import { InstructionData } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@solana/spl-governance'

interface InstructionDataWithHoldUpTime {
  data: InstructionData | null
  holdUpTime: number | undefined
  prerequisiteInstructions: TransactionInstruction[]
}

export const createProposal = async (
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  instructionsData: InstructionDataWithHoldUpTime[],
  isDraft: boolean
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

  const proposalAddress = await withCreateProposal(
    instructions,
    programId,
    programVersion,
    realm,
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
    payer
  )

  await withAddSignatory(
    instructions,
    programId,
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

  for (const [index, instruction] of instructionsData
    .filter((x) => x.data)
    .entries()) {
    if (instruction.data) {
      if (instruction.prerequisiteInstructions) {
        prerequisiteInstructions.push(...instruction.prerequisiteInstructions)
      }
      await withInsertInstruction(
        instructions,
        programId,
        programVersion,
        governance,
        proposalAddress,
        tokenOwnerRecord,
        governanceAuthority,
        index,
        instruction.holdUpTime || 0,
        instruction.data,
        payer
      )
    }
  }

  if (!isDraft) {
    withSignOffProposal(
      instructions,
      programId,
      proposalAddress,
      signatoryRecordAddress,
      signatory
    )
  }

  const transaction = new Transaction()
  //we merge instructions with additionalInstructionTransaction
  //additional transaction instructions can came from instruction as something we need to do before instruction run.
  //e.g ATA creation
  transaction.add(...prerequisiteInstructions, ...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: `creating ${notificationTitle}`,
    successMessage: `${notificationTitle} created`,
  })

  return proposalAddress
}
