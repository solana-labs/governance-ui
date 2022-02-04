import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'

import { Proposal, ProposalTransaction } from '@solana/spl-governance'

import { withExecuteTransaction } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'

export const executeTransaction = async (
  { connection, wallet, programId, programVersion }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  instruction: ProgramAccount<ProposalTransaction>
) => {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  await withExecuteTransaction(
    instructions,
    programId,
    programVersion,
    proposal.account.governance,
    proposal.pubkey,
    instruction.pubkey,
    [instruction.account.getSingleInstruction()]
  )

  const transaction = new Transaction()

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Executing instruction',
    successMessage: 'Execution finalized',
  })
}
