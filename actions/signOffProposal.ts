import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { Proposal, RpcContext } from '@solana/spl-governance'
import { SignatoryRecord } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@solana/spl-governance'

export const signOffProposal = async (
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  realmPk: PublicKey,
  proposal: ProgramAccount<Proposal>,
  signatoryRecord: ProgramAccount<SignatoryRecord>
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []

  withSignOffProposal(
    instructions,
    programId,
    programVersion,
    realmPk,
    proposal.account.governance,
    proposal.pubkey,
    signatoryRecord.account.signatory,
    signatoryRecord?.pubkey,
    undefined
  )

  const transaction = new Transaction()

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Signing off proposal',
    successMessage: 'Proposal signed off',
  })
}
