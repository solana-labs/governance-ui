import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'

import { RpcContext } from '@solana/spl-governance'
import { SignatoryRecord } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@solana/spl-governance'

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

  const txId = await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Signing off proposal',
    successMessage: 'Proposal signed off',
    showNotification: false,
  })
  return txId
}
