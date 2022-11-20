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
  TokenOwnerRecord,
  withCreateGovernance,
  withCreateNativeTreasury,
} from '@solana/spl-governance'
import { withCreateTokenGovernance } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { withCreateSplTokenAccount } from '@models/withCreateSplTokenAccount'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { trySentryLog } from '@utils/logs'

export const createTreasuryAccount = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  mint: PublicKey | null,
  config: GovernanceConfig,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
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
    tokenOwnerRecord,
    'createGovernance'
  )

  const tokenAccount = mint
    ? await withCreateSplTokenAccount(
        connection,
        wallet!,
        instructions,
        signers,
        mint
      )
    : null

  const governanceAuthority = walletPubkey

  const governanceAddress = tokenAccount
    ? await withCreateTokenGovernance(
        instructions,
        programId,
        programVersion,
        realm.pubkey,
        tokenAccount.tokenAccountAddress,
        config,
        true,
        walletPubkey,
        tokenOwnerRecord.pubkey,
        walletPubkey,
        governanceAuthority,
        plugin?.voterWeightPk
      )
    : await withCreateGovernance(
        instructions,
        programId,
        programVersion,
        realm.pubkey,
        undefined,
        config,
        tokenOwnerRecord.pubkey,
        walletPubkey,
        governanceAuthority,
        plugin?.voterWeightPk
      )

  if (!tokenAccount) {
    await withCreateNativeTreasury(
      instructions,
      programId,
      programVersion,
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
  const logInfo = {
    realmId: realm.pubkey.toBase58(),
    realmSymbol: realm.account.name,
    wallet: wallet.publicKey?.toBase58(),
    governanceAddress: governanceAddress,
  }
  trySentryLog({
    tag: 'governanceCreated',
    objToStringify: logInfo,
  })
  return governanceAddress
}
