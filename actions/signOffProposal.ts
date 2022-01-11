import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'

import { RpcContext } from '../models/core/api'
import { SignatoryRecord } from '@models/accounts'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@models/withSignOffProposal'

export const signOffProposal = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  signatoryRecord: ProgramAccount<SignatoryRecord>
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []

  withSignOffProposal(
    instructions,
    programId,
    signatoryRecord?.account.proposal,
    signatoryRecord?.pubkey,
    walletPubkey
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
