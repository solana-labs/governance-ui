import { Proposal, ProposalInstruction } from '@solana/spl-governance'

import { withExecuteInstruction } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendSignedTransaction, signTransaction } from '@utils/send'

import { Transaction, TransactionInstruction } from '@solana/web3.js'

// Magic number (?)
const DEFAULT_TIMEOUT = 31_000

// Merge instructions within one Transaction, sign it and execute it
export const executeInstructions = async (
  { connection, wallet, programId }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  proposalInstructions: ProgramAccount<ProposalInstruction>[]
) => {
  const instructions: TransactionInstruction[] = []

  await Promise.all(
    proposalInstructions.map((instruction) =>
      // withExecuteInstruction function mutate the given 'instructions' parameter
      withExecuteInstruction(
        instructions,
        programId,
        proposal.account.governance,
        proposal.pubkey,
        instruction.pubkey,
        instruction.account.instruction
      )
    )
  )

  const transaction = new Transaction()

  transaction.add(...instructions)

  const signedTransaction = await signTransaction({
    transaction,
    wallet,
    connection,
    signers: [],
  })

  await sendSignedTransaction({
    signedTransaction,
    connection,
    sendingMessage: 'Executing instruction',
    successMessage: 'Execution finalized',
    timeout: DEFAULT_TIMEOUT,
  })
}
