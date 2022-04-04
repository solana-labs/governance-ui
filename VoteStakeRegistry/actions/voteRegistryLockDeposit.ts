import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { RpcContext, TOKEN_PROGRAM_ID } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'

import { BN } from '@project-serum/anchor'
import { LockupType } from 'VoteStakeRegistry/sdk/accounts'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { withCreateNewDeposit } from '../sdk/withCreateNewDeposit'
import { getPeriod } from 'VoteStakeRegistry/tools/deposits'

export const voteRegistryLockDeposit = async ({
  rpcContext,
  mintPk,
  realmPk,
  programId,
  amountFromVoteRegistryDeposit,
  totalTransferAmount,
  lockUpPeriodInDays,
  lockupKind,
  sourceDepositIdx,
  client,
  tokenOwnerRecordPk,
  sourceTokenAccount,
  communityMintPk,
}: {
  rpcContext: RpcContext
  mintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  //amount that will be taken from vote registry deposit
  amountFromVoteRegistryDeposit: BN
  totalTransferAmount: BN
  lockUpPeriodInDays: number
  lockupKind: LockupType
  sourceDepositIdx: number
  tokenOwnerRecordPk: PublicKey | null
  sourceTokenAccount: PublicKey
  communityMintPk: PublicKey
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
    tokenOwnerRecordPk,
    lockUpPeriodInDays,
    lockupKind,
    communityMintPk,
    client,
  })

  if (!amountFromVoteRegistryDeposit.isZero()) {
    const internalTransferUnlockedInstruction = client?.program.instruction.internalTransferUnlocked(
      sourceDepositIdx!,
      depositIdx,
      amountFromVoteRegistryDeposit,
      {
        accounts: {
          registrar: registrar,
          voter: voter,
          voterAuthority: wallet!.publicKey,
        },
      }
    )

    instructions.push(internalTransferUnlockedInstruction)
  }

  if (!fromWalletTransferAmount.isZero() && !fromWalletTransferAmount.isNeg()) {
    const depositInstruction = client?.program.instruction.deposit(
      depositIdx,
      fromWalletTransferAmount,
      {
        accounts: {
          registrar: registrar,
          voter: voter,
          vault: voterATAPk,
          depositToken: sourceTokenAccount,
          depositAuthority: wallet!.publicKey!,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    )
    instructions.push(depositInstruction)
  }

  if (!amountFromVoteRegistryDeposit.isZero()) {
    const period = getPeriod(lockUpPeriodInDays, lockupKind)
    const resetLockup = client?.program.instruction.resetLockup(
      depositIdx,
      { [lockupKind]: {} },
      period,
      {
        accounts: {
          registrar: registrar,
          voter: voter,
          voterAuthority: wallet!.publicKey,
        },
      }
    )

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
