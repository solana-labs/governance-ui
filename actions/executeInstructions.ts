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

  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 })
  )
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
        [instruction.account.getSingleInstruction()]
      )
    )
  )

  if (multiTransactionMode) {
    const txes = [...instructions.map((x) => [x])].map((txBatch, batchIdx) => {
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(
          txBatch,
          [],
          batchIdx
        ),
        sequenceType: SequenceType.Sequential,
      }
    })

    console.log(
      'txes',
      txes,
      txes.map((x) =>
        x.instructionsSet.map((x) =>
          x.transactionInstruction.keys
            .filter((x) => x.isSigner)
            .map((x) => x.pubkey.toString())
        )
      )
    )
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
