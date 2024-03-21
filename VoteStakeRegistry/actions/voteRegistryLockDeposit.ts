import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { RpcContext, TOKEN_PROGRAM_ID } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'

import { BN } from '@coral-xyz/anchor'
import { LockupType } from 'VoteStakeRegistry/sdk/accounts'
import { withCreateNewDeposit } from '../sdk/withCreateNewDeposit'
import { getPeriod } from 'VoteStakeRegistry/tools/deposits'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

export const voteRegistryLockDeposit = async ({
  rpcContext,
  mintPk,
  realmPk,
  programId,
  programVersion,
  amountFromVoteRegistryDeposit,
  totalTransferAmount,
  lockUpPeriodInDays,
  lockupKind,
  sourceDepositIdx,
  client,
  tokenOwnerRecordPk,
  sourceTokenAccount,
  communityMintPk,
  allowClawback = false,
}: {
  rpcContext: RpcContext
  mintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  programVersion: number
  //amount that will be taken from vote registry deposit
  amountFromVoteRegistryDeposit: BN
  totalTransferAmount: BN
  lockUpPeriodInDays: number
  lockupKind: LockupType
  sourceDepositIdx: number
  tokenOwnerRecordPk: PublicKey | null
  sourceTokenAccount: PublicKey
  communityMintPk: PublicKey
  allowClawback?: boolean
  client?: VsrClient
}) => {
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  if (!client) {
    throw 'no vote registry plugin'
  }
  if (!wallet.publicKey) {
    throw 'no wallet connected'
  }
  const fromWalletTransferAmount = totalTransferAmount.sub(
    amountFromVoteRegistryDeposit
  )
  const instructions: TransactionInstruction[] = []
  const {
    depositIdx,
    voter,
    registrar,
    voterATAPk,
  } = await withCreateNewDeposit({
    instructions,
    walletPk: rpcContext.walletPubkey,
    mintPk,
    realmPk,
    programId,
    programVersion,
    tokenOwnerRecordPk,
    lockUpPeriodInDays,
    lockupKind,
    communityMintPk,
    client,
    allowClawback,
  })

  if (!amountFromVoteRegistryDeposit.isZero()) {
    const internalTransferUnlockedInstruction = await client?.program.methods
      .internalTransferUnlocked(
        sourceDepositIdx!,
        depositIdx,
        amountFromVoteRegistryDeposit
      )
      .accounts({
        registrar: registrar,
        voter: voter,
        voterAuthority: wallet!.publicKey,
      })
      .instruction()

    instructions.push(internalTransferUnlockedInstruction)
  }

  if (!fromWalletTransferAmount.isZero() && !fromWalletTransferAmount.isNeg()) {
    const depositInstruction = await client?.program.methods
      .deposit(depositIdx, fromWalletTransferAmount)
      .accounts({
        registrar: registrar,
        voter: voter,
        vault: voterATAPk,
        depositToken: sourceTokenAccount,
        depositAuthority: wallet!.publicKey!,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction()
    instructions.push(depositInstruction)
  }

  if (!amountFromVoteRegistryDeposit.isZero()) {
    const period = getPeriod(lockUpPeriodInDays, lockupKind)
    const resetLockup = await client?.program.methods
      .resetLockup(depositIdx, { [lockupKind]: {} }, period)
      .accounts({
        registrar: registrar,
        voter: voter,
        voterAuthority: wallet!.publicKey,
      })
      .instruction()

    instructions.push(resetLockup)
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
