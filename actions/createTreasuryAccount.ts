import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { GovernanceConfig, ProgramAccount, Realm } from '@solana/spl-governance'

import { withCreateTokenGovernance } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { withCreateSplTokenAccount } from '@models/withCreateSplTokenAccount'
import { withUpdateVoterWeightRecord } from 'VoteStakeRegistry/actions/withUpdateVoterWeightRecord'

export const createTreasuryAccount = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  mint: PublicKey,
  config: GovernanceConfig,
  tokenOwnerRecord: PublicKey
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []

  //will run only with plugin
  await withUpdateVoterWeightRecord(instructions, wallet.publicKey!, realm)

  const tokenAccount = await withCreateSplTokenAccount(
    connection,
    wallet!,
    instructions,
    signers,
    mint
  )

  const governanceAuthority = walletPubkey

  const governanceAddress = (
    await withCreateTokenGovernance(
      instructions,
      programId,
      realm.pubkey,
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
