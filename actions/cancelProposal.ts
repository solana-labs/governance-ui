import { Account, Transaction, TransactionInstruction } from '@solana/web3.js'

import { RpcContext } from '../models/core/api'
import { Proposal } from '@models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { sendTransaction /* simulateTransaction */ } from 'utils/send'
import { withCancelProposal } from '@models/withCancelProposal'
// import { sendTransactionWithNotifications } from '@components/instructions/tools';

export const cancelProposal = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  proposal: ParsedAccount<Proposal> | undefined
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Account[] = []
  const governanceAuthority = walletPubkey

  withCancelProposal(
    instructions,
    programId,
    proposal!.pubkey,
    proposal!.info.tokenOwnerRecord,
    governanceAuthority
  )

  const transaction = new Transaction({ feePayer: walletPubkey })

  transaction.add(...instructions)

  console.log(instructions)

  // await simulateTransaction(connection, transaction, 'single')

  // const transaction = new Transaction({ feePayer: walletPubkey })

  // transaction.add({
  //   keys: instructions['9AMBKaTDuFS216cYdegrNEDCsfTFxAo1e3i9UwtWtK47'].info.instruction.accounts,
  //   programId: instructions['9AMBKaTDuFS216cYdegrNEDCsfTFxAo1e3i9UwtWtK47'].info.instruction.programId,
  //   data: Buffer.from(instructions['9AMBKaTDuFS216cYdegrNEDCsfTFxAo1e3i9UwtWtK47'].info.instruction.data),
  // })

  // console.log('instructions', instructions)

  // instructions['9AMBKaTDuFS216cYdegrNEDCsfTFxAo1e3i9UwtWtK47'].info.instruction

  // await dryRunInstruction(connection, wallet!, instructions['9AMBKaTDuFS216cYdegrNEDCsfTFxAo1e3i9UwtWtK47'].info.instruction)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Cancelling proposal',
    successMessage: 'Proposal cancelled',
  })

  // await sendTransactionWithNotifications(
  //   connection,
  //   wallet,
  //   instructions2,
  //   signers,
  //   'Cancelling proposal',
  //   'Proposal cancelled',
  // );
}
