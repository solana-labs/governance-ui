import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { withCreateProposal } from '../models/withCreateProposal'
import { withAddSignatory } from '../models/withAddSignatory'
import { RpcContext } from '../models/core/api'
import { withInsertInstruction } from '@models/withInsertInstruction'
import { InstructionData } from '@models/accounts'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@models/withSignOffProposal'

interface InstructionDataWithHoldUpTime {
  data: InstructionData
  holdUpTime: number | undefined
}

export const createProposal = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
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
  const signers: Account[] = []
  const governanceAuthority = walletPubkey
  const signatory = walletPubkey
  const payer = walletPubkey
  const notificationTitle = isDraft ? 'proposal draft' : 'proposal'

  const proposalAddress = await withCreateProposal(
    instructions,
    programId,
    realm,
    governance,
    tokenOwnerRecord,
    name,
    descriptionLink,
    governingTokenMint,
    governanceAuthority,
    proposalIndex,
    payer
  )

  const signatoryRecordAddress = await withAddSignatory(
    instructions,
    programId,
    proposalAddress,
    tokenOwnerRecord,
    governanceAuthority,
    signatory,
    payer
  )
  for (const [index, instruction] of instructionsData.entries()) {
    await withInsertInstruction(
      instructions,
      programId,
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

  if (!isDraft) {
    await withSignOffProposal(
      instructions,
      programId,
      proposalAddress,
      signatoryRecordAddress,
      signatory
    )
  }

  const transaction = new Transaction()
  transaction.add(...instructions)

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
