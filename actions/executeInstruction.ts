import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'

import { Proposal, ProposalInstruction } from '../models/accounts'

import { withExecuteInstruction } from '../models/withExecuteInstruction'
import { RpcContext } from '@models/core/api'
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
