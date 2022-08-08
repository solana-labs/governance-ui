import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { withVoteRegistryWithdraw } from '../sdk/withVoteRegistryWithdraw'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

export const voteRegistryWithdraw = async ({
  rpcContext,
  mintPk,
  realmPk,
  amount,
  tokenOwnerRecordPubKey,
  depositIndex,
  closeDepositAfterOperation,
  communityMintPk,
  client,
}: {
  rpcContext: RpcContext
  mintPk: PublicKey
  realmPk: PublicKey
  communityMintPk: PublicKey
  amount: BN
  tokenOwnerRecordPubKey: PublicKey
  depositIndex: number
  //if we want to close deposit after doing operation we need to fill this because we can close only deposits that have 0 tokens inside
  closeDepositAfterOperation?: boolean
  client?: VsrClient
}) => {
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  const instructions: TransactionInstruction[] = []
  await withVoteRegistryWithdraw({
    instructions,
    walletPk: wallet!.publicKey!,
    mintPk,
    realmPk,
    amount,
    tokenOwnerRecordPubKey,
    depositIndex,
    closeDepositAfterOperation,
    communityMintPk,
    connection,
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
