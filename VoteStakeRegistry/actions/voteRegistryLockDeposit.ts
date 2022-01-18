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
import { withCreateNewDepositInstructions } from './withCreateNewDepositInstructions'

export const voteRegistryLockDeposit = async ({
  rpcContext,
  mintPk,
  realmPk,
  programId,
  fromRealmDepositAmount,
  totalTransferAmount,
  lockUpPeriodInDays,
  lockupKind,
  sourceDepositIdx,
  client,
  tokenOwnerRecordPk,
  tempHolderPk,
}: {
  rpcContext: RpcContext
  //e.g council or community
  mintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  fromRealmDepositAmount: BN
  totalTransferAmount: BN
  lockUpPeriodInDays: number
  lockupKind: LockupType
  sourceDepositIdx: number
  tokenOwnerRecordPk: PublicKey | null
  tempHolderPk: PublicKey
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
  const instructions: TransactionInstruction[] = []
  const {
    depositIdx,
    voter,
    registrar,
    voterATAPk,
    tokenOwnerRecordPubKey,
    voterWeight,
  } = await withCreateNewDepositInstructions({
    instructions,
    rpcContext,
    mintPk,
    realmPk,
    programId,
    tokenOwnerRecordPk,
    lockUpPeriodInDays,
    lockupKind,
    forceCreateNew: true,
    client,
  })

  if (!fromRealmDepositAmount.isZero()) {
    const withdrawInstruction = client?.program.instruction.withdraw(
      sourceDepositIdx!,
      fromRealmDepositAmount,
      {
        accounts: {
          registrar: registrar,
          voter: voter,
          voterAuthority: wallet!.publicKey,
          tokenOwnerRecord: tokenOwnerRecordPubKey || tokenOwnerRecordPk,
          voterWeightRecord: voterWeight,
          vault: voterATAPk,
          destination: tempHolderPk,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    )

    instructions.push(withdrawInstruction)
  }

  const depositInstruction = client?.program.instruction.deposit(
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
