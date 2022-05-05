import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import {
  sendSignedAndAdjacentTransactions,
  sendTransaction,
  signTransactions,
} from '@utils/send'
import {
  InstructionOption,
  InstructionOptions,
} from '@components/InstructionOptions'
import Wallet from '@project-serum/sol-wallet-adapter'
import {
  getCastleRefreshInstruction,
  getCastleReconcileInstruction,
} from '@utils/instructions/Castle'
// import { ProgramAccount } from '@project-serum/anchor'
import {
  RpcContext,
  Proposal,
  ProposalTransaction,
  getGovernanceProgramVersion,
  withExecuteTransaction,
  WalletSigner,
  ProgramAccount,
} from '@solana/spl-governance'

export const executeTransaction = async (
  { connection, wallet, programId }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  instruction: ProgramAccount<ProposalTransaction>,
  instructionOption: InstructionOption
) => {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  await withExecuteTransaction(
    instructions,
    programId,
    programVersion,
    proposal.account.governance,
    proposal.pubkey,
    instruction.pubkey,
    [instruction.account.getSingleInstruction()]
  )

  // Create proposal instruction
  const transaction = new Transaction().add(...instructions)

  console.log(instructionOption)
  // Send transaction based on its execution option
  switch (instructionOption) {
    case InstructionOptions.castleRefresh:
      return await executeWithRefresh(
        transaction,
        connection,
        wallet,
        instruction
      )
    case InstructionOptions.castleReconcileRefresh:
      return await executeWithRefreshAndReconcile(
        transaction,
        connection,
        wallet,
        instruction
      )
    default:
      await sendTransaction({
        transaction,
        wallet,
        connection,
        signers,
        sendingMessage: 'Executing instruction',
        successMessage: 'Execution finalized',
      })
  }
}

/**
 * Signs and sends proposal transaction with refresh transaction adjacent to it, aiming
 * for both to be in the same slot.
 * @param tx Proposal transaction
 * @param connection
 * @param wallet
 */
const executeWithRefresh = async (
  tx: Transaction,
  connection: Connection,
  wallet: WalletSigner,
  instruction: ProgramAccount<ProposalTransaction>
) => {
  const refreshIx = await getCastleRefreshInstruction(
    connection,
    wallet,
    instruction
  )

  const refreshTx = new Transaction().add(refreshIx)

  // Attempt to send both transactions in the same slot
  const [signedTransaction, signedRefreshTx] = await signTransactions({
    transactionsAndSigners: [{ transaction: tx }, { transaction: refreshTx }],
    wallet: (wallet as unknown) as Wallet,
    connection,
  })

  await sendSignedAndAdjacentTransactions({
    signedTransaction,
    adjacentTransaction: signedRefreshTx,
    connection,
    sendingMessage: 'Executing instruction',
    successMessage: 'Execution finalized',
  })
}

/**
 * Withdraw requires three transactions
 * (1) reconcile and refresh ixs
 * (2) refresh and withdraw ixs.
 * @param tx Proposal transaction
 * @param connection
 * @param wallet
 */
const executeWithRefreshAndReconcile = async (
  tx: Transaction,
  connection: Connection,
  wallet: WalletSigner,
  instruction: ProgramAccount<ProposalTransaction>
) => {
  console.log('executing with reconcile')
  // Get reconcile txs
  const reconcileTxs = await getCastleReconcileInstruction(
    connection,
    wallet,
    instruction
  )

  console.log('reconcileTxs', reconcileTxs)
  // Sign and send off all reconcile txs
  await Promise.all(
    reconcileTxs.map((transaction) =>
      sendTransaction({
        transaction,
        wallet,
        connection,
        // sendingMessage: 'Cancelling proposal',
        successMessage: 'Send reconcile tx',
      })
    )
  )

  // Get refresh Tx and sign alongside withdraw
  const refreshIx = await getCastleRefreshInstruction(
    connection,
    wallet,
    instruction
  )

  const refreshTx = new Transaction().add(refreshIx)

  // Attempt to send both transactions in the same slot
  const [signedProposalTx, signedRefreshTx] = await signTransactions({
    transactionsAndSigners: [{ transaction: tx }, { transaction: refreshTx }],
    wallet: (wallet as unknown) as Wallet,
    connection,
  })

  // Send off refresh + withdraw transactions
  await sendSignedAndAdjacentTransactions({
    signedTransaction: signedProposalTx,
    adjacentTransaction: signedRefreshTx,
    connection,
    sendingMessage: 'Executing instruction',
    successMessage: 'Execution finalized',
  })
}
