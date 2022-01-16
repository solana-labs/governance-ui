import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { RpcContext, TOKEN_PROGRAM_ID } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'

import { BN } from '@project-serum/anchor'
import { LockupKinds } from 'VoteStakeRegistry/utils/voteRegistryTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { getPrepareDepositInstructions } from './getPrepareDepositInstructions'

export const voteRegistryDepositWithInternalTransferInstruction = async ({
  rpcContext,
  //except transferring founds between deposits we can additionally run deposit from wallet
  fromWalletPk,
  mint,
  realmPk,
  programId,
  walletAmount,
  transferAmount,
  lockUpPeriodInSeconds = 0,
  lockupKind = 'none',
  sourceDepositIdx,
  client,
}: {
  rpcContext: RpcContext
  //from where we deposit our founds
  fromWalletPk?: PublicKey
  //e.g council or community
  mint: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  //if we want to deposit from wallet to
  walletAmount?: BN
  transferAmount: BN
  hasTokenOwnerRecord: boolean
  lockUpPeriodInSeconds?: number
  lockupKind?: LockupKinds
  sourceDepositIdx: number
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
  const {
    instructions: prepareDepositInstructions,
    depositIdx,
    voter,
    registrar,
    voterATAPk,
  } = await getPrepareDepositInstructions({
    rpcContext,
    mint,
    realmPk,
    programId,
    hasTokenOwnerRecord: false,
    lockUpPeriodInSeconds,
    lockupKind,
    forceCreateNew: true,
    client,
  })
  const transaction = new Transaction()
  transaction.add(...prepareDepositInstructions)

  const transferInstruction = client.program.instruction.internalTransfer(
    sourceDepositIdx,
    depositIdx,
    transferAmount,
    {
      accounts: {
        registrar: registrar,
        voter: voter,
        voterAuthority: wallet.publicKey,
      },
    }
  )

  transaction.add(transferInstruction)

  //with internal transfer its available to deposit from wallet
  if (fromWalletPk && walletAmount) {
    const depositInstruction = client?.program.instruction.deposit(
      depositIdx,
      walletAmount,
      {
        accounts: {
          registrar: registrar,
          voter: voter,
          vault: voterATAPk,
          depositToken: fromWalletPk,
          depositAuthority: wallet!.publicKey!,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    )
    transaction.add(depositInstruction)
  }
  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: `Depositing`,
    successMessage: `Deposit successful`,
  })
}
