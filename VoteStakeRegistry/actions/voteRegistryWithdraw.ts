import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { withVoteRegistryWithdraw } from '../sdk/withVoteRegistryWithdraw'
import { RpcContext } from '@solana/spl-governance'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'

export const voteRegistryWithdraw = async ({
  rpcContext,
  mintPk,
  realmPk,
  amount,
  tokenOwnerRecordPubKey,
  depositIndex,
  closeDepositAfterOperation,
  splProgramId,
  splProgramVersion,
  communityMintPk,
  client,
}: {
  rpcContext: RpcContext
  mintPk: PublicKey
  realmPk: PublicKey
  communityMintPk: PublicKey
  amount: BN
  tokenOwnerRecordPubKey: PublicKey | undefined
  depositIndex: number
  splProgramId: PublicKey
  splProgramVersion: number
  //if we want to close deposit after doing operation we need to fill this because we can close only deposits that have 0 tokens inside
  closeDepositAfterOperation?: boolean
  client?: VsrClient
}) => {
  const { wallet, connection } = rpcContext
  const instructions: TransactionInstruction[] = []
  //spl governance tokenownerrecord pubkey
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
    splProgramId,
    splProgramVersion,
  })
  const txes = [instructions].map((txBatch) => {
    return {
      instructionsSet: txBatch.map((x) => {
        return {
          transactionInstruction: x,
        }
      }),
      sequenceType: SequenceType.Sequential,
    }
  })

  await sendTransactionsV3({
    connection,
    wallet,
    transactionInstructions: txes,
  })
}
