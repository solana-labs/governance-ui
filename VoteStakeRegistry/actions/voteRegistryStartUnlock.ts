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
import { withCreateNewDeposit } from '../sdk/withCreateNewDeposit'

export const voteRegistryLockDeposit = async ({
  rpcContext,
  mintPk,
  realmPk,
  programId,
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
  transferAmount: BN
  //amount left in deposit after operation
  amountAfterOperation: BN
  lockUpPeriodInDays: number
  sourceDepositIdx: number
  tokenOwnerRecordPk: PublicKey | null
  client?: VsrClient
}) => {
  const lockupKind = 'cliff'
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
    tokenOwnerRecordPk,
    lockUpPeriodInDays,
    lockupKind,
    client,
  })

  const internalTransferInst = client?.program.instruction.internalTransfer(
    sourceDepositIdx,
    depositIdx,
    transferAmount,
    {
      accounts: {
        registrar,
        voter,
        voterAuthority: wallet.publicKey,
      },
    }
  )
  instructions.push(internalTransferInst)

  if (amountAfterOperation && amountAfterOperation?.isZero()) {
    const close = client.program.instruction.closeDepositEntry(
      sourceDepositIdx,
      {
        accounts: {
          voter: voter,
          voterAuthority: wallet.publicKey,
        },
      }
    )
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
