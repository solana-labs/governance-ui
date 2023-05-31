import {
  ProgramAccount,
  Proposal,
  ProposalTransaction,
  RpcContext,
  withExecuteTransaction,
} from '@solana/spl-governance'
import {
  ComputeBudgetProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { sendSignedTransaction, signTransaction } from '@utils/send'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'

export const executeInstructions = async (
  { connection, wallet, programId, programVersion }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  proposalInstructions: ProgramAccount<ProposalTransaction>[],
  multiTransactionMode = false
) => {
  const instructions: TransactionInstruction[] = []

  await Promise.all(
    proposalInstructions.map((instruction) =>
      // withExecuteTransaction function mutate the given 'instructions' parameter
      withExecuteTransaction(
        instructions,
        programId,
        programVersion,
        proposal.account.governance,
        proposal.pubkey,
        instruction.pubkey,
        [...instruction.account.getAllInstructions()]
      )
    )
  )
  if (multiTransactionMode) {
    const txes = [...instructions.map((x) => [x])].map((txBatch, batchIdx) => {
      const batchWithComputeBudget = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
        ...txBatch,
      ]
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(
          batchWithComputeBudget,
          [],
          batchIdx
        ),
        sequenceType: SequenceType.Sequential,
      }
    })
    await sendTransactionsV3({
      connection,
      wallet,
      transactionInstructions: txes,
    })
  } else {
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
    })
  }
}
