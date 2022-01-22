import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { RpcContext, TOKEN_PROGRAM_ID } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'

import { BN } from '@project-serum/anchor'
import { LockupType } from 'VoteStakeRegistry/utils/voteRegistryTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { withCreateNewDeposit } from '../sdk/withCreateNewDeposit'

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
  vsrClient,
  tokenOwnerRecordPk,
  tempHolderPk,
}: {
  rpcContext: RpcContext
  mintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  //amount that will be taken from vote registry deposit
  amountFromVoteRegistryDeposit: BN
  //tokens can be transferred from wallet and deposit together.
  totalTransferAmount: BN
  lockUpPeriodInDays: number
  lockupKind: LockupType
  sourceDepositIdx: number
  tokenOwnerRecordPk: PublicKey | null
  //to deposit from one deposit to another we need to withdraw tokens somewhere first
  tempHolderPk: PublicKey
  vsrClient?: VsrClient
}) => {
  const signers: Keypair[] = []
  const { wallet, connection } = rpcContext
  if (!vsrClient) {
    throw 'no vote registry plugin'
  }
  if (!wallet.publicKey) {
    throw 'no wallet connected'
  }
  const instructions: TransactionInstruction[] = []
  const {
    depositIdx,
    voter,
    registrar,
    voterATAPk,
    tokenOwnerRecordPubKey,
    voterWeightPk,
  } = await withCreateNewDeposit({
    instructions,
    rpcContext,
    mintPk,
    realmPk,
    programId,
    tokenOwnerRecordPk,
    lockUpPeriodInDays,
    lockupKind,
    vsrClient,
  })

  //to transfer tokens from one deposit to another we need to withdraw them first to some tokenaccount.
  if (!amountFromVoteRegistryDeposit.isZero()) {
    const withdrawInstruction = vsrClient?.program.instruction.withdraw(
      sourceDepositIdx!,
      amountFromVoteRegistryDeposit,
      {
        accounts: {
          registrar: registrar,
          voter: voter,
          voterAuthority: wallet!.publicKey,
          tokenOwnerRecord: tokenOwnerRecordPubKey || tokenOwnerRecordPk,
          voterWeightRecord: voterWeightPk,
          vault: voterATAPk,
          destination: tempHolderPk,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    )

    instructions.push(withdrawInstruction)
  }

  const depositInstruction = vsrClient?.program.instruction.deposit(
    depositIdx,
    totalTransferAmount,
    {
      accounts: {
        registrar: registrar,
        voter: voter,
        vault: voterATAPk,
        depositToken: tempHolderPk,
        depositAuthority: wallet!.publicKey!,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  )
  instructions.push(depositInstruction)

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
