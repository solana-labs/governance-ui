import {
  ComputeBudgetProgram,
  Keypair,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import {
  sendSignedAndAdjacentTransactions,
  sendTransaction,
  signTransactions,
} from '@utils/send'
import Wallet from '@project-serum/sol-wallet-adapter'
import {
  RpcContext,
  Proposal,
  ProposalTransaction,
  withExecuteTransaction,
  ProgramAccount,
} from '@solana/spl-governance'
import { fetchProgramVersion } from '@hooks/queries/useProgramVersionQuery'

/**
 * Executes a proposal transaction
 * @param rpcContext RPC contextual information
 * @param proposal Metadata about the proposal
 * @param instruction Instruction that will be executed by the proposal
 * @param adjacentTransaction Optional transaction that is sent in the same slot as the proposal instruction.
 * @param preExecutionTransactions Optional tansactions that are executed before the proposal instruction
 */
export const executeTransaction = async (
  { connection, wallet, programId }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  instruction: ProgramAccount<ProposalTransaction>,
  adjacentTransaction?: Transaction,
  preExecutionTransactions?: Transaction[]
) => {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await fetchProgramVersion(connection, programId)

  await withExecuteTransaction(
    instructions,
    programId,
    programVersion,
    proposal.account.governance,
    proposal.pubkey,
    instruction.pubkey,
    [...instruction.account.getAllInstructions()]
  )

  // Create proposal transaction
  const proposalTransaction = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1000000 }),
    ...instructions
  )

  // Sign and send all pre-execution transactions
  if (preExecutionTransactions && !preExecutionTransactions?.length) {
    await Promise.all(
      preExecutionTransactions.map((transaction) =>
        sendTransaction({
          transaction,
          wallet,
          connection,
          sendingMessage: 'Sending pre-execution transaction',
          successMessage: 'Sent pre-execution transaction',
        })
      )
    )
  }

  // Some proposals require additional adjacent transactions due to tx size limits
  if (adjacentTransaction) {
    const [signedProposalTx, signedAdjacentTx] = await signTransactions({
      transactionsAndSigners: [
        { transaction: proposalTransaction },
        { transaction: adjacentTransaction },
      ],
      wallet: (wallet as unknown) as Wallet,
      connection,
    })
    // Send proposal transaction with prepended adjacent transaction
    await sendSignedAndAdjacentTransactions({
      signedTransaction: signedProposalTx,
      adjacentTransaction: signedAdjacentTx,
      connection,
      sendingMessage: 'Executing instruction',
      successMessage: 'Execution finalized',
    })
  } else {
    // Send the proposal transaction
    await sendTransaction({
      transaction: proposalTransaction,
      wallet,
      connection,
      signers,
      sendingMessage: 'Executing instruction',
      successMessage: 'Execution finalized',
    })
  }
}
