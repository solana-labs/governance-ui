import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import {
  getGovernanceProgramVersion,
  GovernanceConfig,
  ProgramAccount,
  Realm,
  withCreateNativeTreasury,
} from '@solana/spl-governance'

import { withCreateTokenGovernance } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { withCreateSplTokenAccount } from '@models/withCreateSplTokenAccount'
import { DEFAULT_NATIVE_SOL_MINT } from '@components/instructions/tools'
import { VotingClient } from '@utils/uiTypes/VotePlugin'

export const createTreasuryAccount = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  mint: PublicKey,
  config: GovernanceConfig,
  tokenOwnerRecord: PublicKey,
  client?: VotingClient
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  //will run only if plugin is connected with realm
  const plugin = await client?.withUpdateVoterWeightRecord(
    instructions,
    'createGovernance'
  )

  const tokenAccount = await withCreateSplTokenAccount(
    connection,
    wallet!,
    instructions,
    signers,
    mint
  )

  const governanceAuthority = walletPubkey

  const governanceAddress = await withCreateTokenGovernance(
    instructions,
    programId,
    programVersion,
    realm.pubkey,
    tokenAccount.tokenAccountAddress,
    config,
    true,
    walletPubkey,
    tokenOwnerRecord,
    walletPubkey,
    governanceAuthority,
    plugin?.voterWeightPk
  )

  if (mint.toBase58() === DEFAULT_NATIVE_SOL_MINT) {
    await withCreateNativeTreasury(
      instructions,
      programId,
      governanceAddress,
      walletPubkey
    )
  }

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
