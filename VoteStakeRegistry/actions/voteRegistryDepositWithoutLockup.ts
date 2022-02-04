import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'

import { BN } from '@project-serum/anchor'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { withVoteRegistryDeposit } from '../sdk/withVoteRegistryDeposit'

export const voteRegistryDepositWithoutLockup = async ({
  rpcContext,
  fromPk,
  mintPk,
  realmPk,
  communityMintPk,
  programId,
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
  amount: BN
  tokenOwnerRecordPk: PublicKey | null
  client?: VsrClient
}) => {
  const lockUpPeriodInDays = 0
  const lockupKind = 'none'
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  const instructions: TransactionInstruction[] = []
  await withVoteRegistryDeposit({
    instructions,
    walletPk: rpcContext.walletPubkey,
    fromPk,
    mintPk,
    realmPk,
    programId,
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
