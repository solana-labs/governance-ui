import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'

import { BN } from '@project-serum/anchor'
import { LockupKinds } from 'VoteStakeRegistry/utils/voteRegistryTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { withVoteRegistryDepositInstructions } from './withVoteRegistryDepositInstructions'

export const voteRegistryDeposit = async ({
  rpcContext,
  //from where we deposit our founds
  fromPk,
  mint,
  realmPk,
  programId,
  amount,
  hasTokenOwnerRecord,
  lockUpPeriodInDays = 0,
  lockupKind = 'none',
  forceCreateNew = false,
  client,
}: {
  rpcContext: RpcContext
  //from where we deposit our founds
  fromPk: PublicKey
  //e.g council or community
  mint: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  amount: BN
  hasTokenOwnerRecord: boolean
  lockUpPeriodInDays?: number
  lockupKind?: LockupKinds
  forceCreateNew?: boolean
  client?: VsrClient
}) => {
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  const instructions = await withVoteRegistryDepositInstructions({
    rpcContext,
    //from where we deposit our founds
    fromPk,
    mint,
    realmPk,
    programId,
    amount,
    hasTokenOwnerRecord,
    lockUpPeriodInDays,
    lockupKind,
    forceCreateNew,
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
