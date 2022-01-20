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

export const voteRegistryWithdraw = async ({
  rpcContext,
  toPubKey,
  mintPk,
  realmPk,
  amount,
  tokenOwnerRecordPubKey,
  depositIndex,
  amountAfterOperation,
  client,
}: {
  rpcContext: RpcContext
  toPubKey: PublicKey
  mintPk: PublicKey
  realmPk: PublicKey
  amount: BN
  tokenOwnerRecordPubKey: PublicKey
  depositIndex: number
  //if we want to close deposit after doing operation we need to fill this because we can close only deposits that have 0 tokens inside
  amountAfterOperation?: BN
  client?: VsrClient
}) => {
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  const instructions: TransactionInstruction[] = []
  await withVoteRegistryWithdraw({
    instructions,
    walletPk: wallet!.publicKey!,
    toPubKey,
    mintPk,
    realmPk,
    amount,
    tokenOwnerRecordPubKey,
    depositIndex,
    amountAfterOperation,
    client,
  })

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
