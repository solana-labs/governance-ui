import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { withCreateProposal } from '../models/withCreateProposal'
import { withAddSignatory } from '../models/withAddSignatory'
import { RpcContext, SYSTEM_PROGRAM_ID } from '../models/core/api'
import { withInsertInstruction } from '@models/withInsertInstruction'
import { InstructionData } from '@models/accounts'
import { sendTransaction } from 'utils/send'

export const createProposalDraft = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  holdUpTime: number,
  proposalIndex: number,
  instructionsData: InstructionData[]
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const signers: Account[] = []
  const systemId = SYSTEM_PROGRAM_ID
  const governanceAuthority = walletPubkey
  const signatory = walletPubkey
  const payer = walletPubkey

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
    payer,
    systemId
  )

  console.log({
    instructions,
    programId: programId.toString(),
    realm: realm.toString(),
    governance: governance.toString(),
    tokenOwnerRecord: tokenOwnerRecord.toString(),
    name,
    descriptionLink,
    governingTokenMint: governingTokenMint.toString(),
    governanceAuthority: governanceAuthority.toString(),
    proposalIndex,
    payer: payer.toString(),
    systemId: systemId.toString(),
  })

  // Add the proposal creator as the default signatory
  await withAddSignatory(
    instructions,
    programId,
    proposalAddress,
    tokenOwnerRecord,
    governanceAuthority,
    signatory,
    payer,
    systemId
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
      holdUpTime,
      instruction,
      payer,
      systemId
    )
  }

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({ transaction, wallet, connection, signers })

  return proposalAddress
}
