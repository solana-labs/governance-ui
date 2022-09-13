import {
  ProgramAccount,
  Proposal,
  ProposalTransaction,
  RpcContext,
  withExecuteTransaction,
} from '@solana/spl-governance'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { sendSignedTransaction, signTransaction } from '@utils/send'
import {
  sendTransactionsV2,
  SequenceType,
  transactionInstructionsToTypedInstructionsSets,
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
        [instruction.account.getSingleInstruction()]
      )
    )
  )

  if (multiTransactionMode) {
    await sendTransactionsV2({
      connection,
      showUiComponent: true,
      wallet: wallet!,
      signersSet: Array(instructions.length).fill([]),
      TransactionInstructions: instructions.map((x) =>
        transactionInstructionsToTypedInstructionsSets(
          [x],
          SequenceType.Parallel
        )
      ),
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
