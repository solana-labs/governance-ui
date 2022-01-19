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
  toPubKey: PublicKey,
  mintPk: PublicKey,
  realmPubKey: PublicKey,
  amount: BN,
  tokenOwnerRecordPubKey: PublicKey,
  depositIndex: number,
  client?: VsrClient
) => {
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  const instructions: TransactionInstruction[] = []
  await withVoteRegistryWithdraw(
    instructions,
    wallet!.publicKey!,
    toPubKey,
    mintPk,
    realmPubKey,
    amount,
    tokenOwnerRecordPubKey,
    depositIndex,
    client
  )

  //todo close deposit if 0 tokens inside
  //   const close = client.program.instruction.closeDepositEntry(0, {
  //     accounts: {
  //       voter: voter,
  //       voterAuthority: wallet.publicKey,
  //     },
  //   })
  //   instructions.push(close)
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
