import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { GovernanceConfig } from '../models/accounts'

import { withCreateTokenGovernance } from '../models/withCreateTokenGovernance'
import { RpcContext } from '../models/core/api'
import { sendTransaction } from '@utils/send'
import { withCreateSplTokenAccount } from '@models/withCreateSplTokenAccount'

export const createTreasuryAccount = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: PublicKey,
  mint: PublicKey,
  config: GovernanceConfig,
  tokenOwnerRecord: PublicKey
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []

  const tokenAccount = await withCreateSplTokenAccount(
    connection,
    wallet,
    instructions,
    signers,
    mint
  )

  const governanceAuthority = walletPubkey

  const governanceAddress = (
    await withCreateTokenGovernance(
      instructions,
      programId,
      realm,
      tokenAccount.tokenAccountAddress,
      config,
      true,
      walletPubkey,
      tokenOwnerRecord,
      walletPubkey,
      governanceAuthority
    )
  ).governanceAddress

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Creating treasury account',
    successMessage: 'Treasury account has been created',
  })

  return governanceAddress
}
