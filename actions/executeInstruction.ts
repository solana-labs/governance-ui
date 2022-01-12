import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'

import { Proposal, ProposalInstruction } from '@solana/spl-governance'

import { withExecuteInstruction } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'

export const executeInstruction = async (
  { connection, wallet, programId }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  instruction: ProgramAccount<ProposalInstruction>
) => {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  await withExecuteInstruction(
    instructions,
    programId,
    proposal.account.governance,
    proposal.pubkey,
    instruction.pubkey,
    instruction.account.instruction
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
