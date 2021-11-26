import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { RpcContext } from '../models/core/api'
import { sendTransaction } from '../utils/send'
import { withRemoveEntry } from '@models/registry/withRemoveEntry'

export async function removeRealm(
  { connection, wallet, walletPubkey }: RpcContext,
  realmAddress: PublicKey
): Promise<string> {
  const instructions: TransactionInstruction[] = []

  await withRemoveEntry(instructions, realmAddress, walletPubkey)

  const transaction = new Transaction()
  transaction.add(...instructions)

  return await sendTransaction({ transaction, wallet, connection })
}
