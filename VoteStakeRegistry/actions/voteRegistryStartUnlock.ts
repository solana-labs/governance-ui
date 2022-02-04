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

export const voteRegistryStartUnlock = async ({
  rpcContext,
  mintPk,
  realmPk,
  communityMintPk,
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
    lockUpPeriodInDays: period,
    lockupKind,
    communityMintPk,
    client,
  })

  const internalTransferInst = client?.program.instruction.internalTransferLocked(
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
