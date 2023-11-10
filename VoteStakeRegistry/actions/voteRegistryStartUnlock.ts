import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'

import { BN } from '@coral-xyz/anchor'
import { withCreateNewDeposit } from '../sdk/withCreateNewDeposit'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

export const voteRegistryStartUnlock = async ({
  rpcContext,
  mintPk,
  realmPk,
  communityMintPk,
  programId,
  programVersion,
  transferAmount,
  amountAfterOperation,
  lockUpPeriodInDays,
  sourceDepositIdx,
  client,
  tokenOwnerRecordPk,
}: {
  rpcContext: RpcContext
  mintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  programVersion: number
  communityMintPk: PublicKey
  transferAmount: BN
  //amount left in deposit after operation
  amountAfterOperation: BN
  lockUpPeriodInDays: number
  sourceDepositIdx: number
  tokenOwnerRecordPk: PublicKey | null
  client?: VsrClient
}) => {
  //adding one day to lockupPeriod when unlocking to avoid difference in front/backend calculation of period
  //period have to be same or higher then deposit has that we unlock
  const period = lockUpPeriodInDays + 1
  const lockupKind = 'constant'
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  if (!client) {
    throw 'no vote registry plugin'
  }
  if (!wallet.publicKey) {
    throw 'no wallet connected'
  }
  const instructions: TransactionInstruction[] = []
  const { depositIdx, voter, registrar } = await withCreateNewDeposit({
    instructions,
    walletPk: rpcContext.walletPubkey,
    mintPk,
    realmPk,
    programId,
    programVersion,
    tokenOwnerRecordPk,
    lockUpPeriodInDays: period,
    lockupKind,
    communityMintPk,
    client,
  })

  const internalTransferInst = await client?.program.methods
    .internalTransferLocked(sourceDepositIdx, depositIdx, transferAmount)
    .accounts({
      registrar,
      voter,
      voterAuthority: wallet.publicKey,
    })
    .instruction()
  instructions.push(internalTransferInst)

  if (amountAfterOperation && amountAfterOperation?.isZero()) {
    const close = await client.program.methods
      .closeDepositEntry(sourceDepositIdx)
      .accounts({
        voter: voter,
        voterAuthority: wallet.publicKey,
      })
      .instruction()
    instructions.push(close)
  }

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
