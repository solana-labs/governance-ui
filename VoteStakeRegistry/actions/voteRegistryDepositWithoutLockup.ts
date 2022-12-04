import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'

import { BN } from '@project-serum/anchor'
import { withVoteRegistryDeposit } from '../sdk/withVoteRegistryDeposit'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

export const voteRegistryDepositWithoutLockup = async ({
  rpcContext,
  fromPk,
  mintPk,
  realmPk,
  communityMintPk,
  programId,
  programVersion,
  amount,
  tokenOwnerRecordPk,
  client,
}: {
  rpcContext: RpcContext
  //from where we deposit our founds
  fromPk: PublicKey
  mintPk: PublicKey
  communityMintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  programVersion: number
  amount: BN
  tokenOwnerRecordPk: PublicKey | null
  client?: VsrClient
}) => {
  const lockUpPeriodInDays = 0
  const lockupKind = 'none'
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  const instructions: TransactionInstruction[] = []
  console.log({
    fromPk: fromPk,
  })
  await withVoteRegistryDeposit({
    instructions,
    walletPk: rpcContext.walletPubkey,
    fromPk,
    mintPk,
    realmPk,
    programId,
    programVersion,
    amount,
    tokenOwnerRecordPk,
    lockUpPeriodInDays,
    communityMintPk,
    lockupKind,
    client,
  })

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: `Depositing`,
    successMessage: `Deposit successful`,
  })
}
