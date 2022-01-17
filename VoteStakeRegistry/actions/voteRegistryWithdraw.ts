import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { withVoteRegistryWithdraw } from './withVoteRegistryWithdraw'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'

export const voteRegistryWithdraw = async (
  rpcContext: RpcContext,
  //from where we deposit our founds
  toPubKey: PublicKey,
  //e.g council or community
  mint: PublicKey,
  realmPubKey: PublicKey,
  amount: BN,
  tokenOwnerRecordPubKey: PublicKey,
  depositIndex?: number,
  client?: VsrClient
) => {
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  if (!client) {
    throw 'no vote registry plugin'
  }
  if (!wallet) {
    throw 'no wallet connected'
  }
  const instructions: TransactionInstruction[] = []
  await withVoteRegistryWithdraw(
    instructions,
    wallet!.publicKey!,
    toPubKey,
    mint,
    realmPubKey,
    amount,
    tokenOwnerRecordPubKey,
    depositIndex,
    client
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: `Withdrawing`,
    successMessage: `Withdraw successful`,
  })
}
