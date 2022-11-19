import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  getGovernanceProgramVersion,
  GovernanceType,
  ProgramAccount,
  Realm,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { GovernanceConfig } from '@solana/spl-governance'
import { withCreateProgramGovernance } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { trySentryLog } from '@utils/logs'

export const registerProgramGovernance = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  governanceType: GovernanceType,
  realm: ProgramAccount<Realm>,
  governedAccount: PublicKey,
  config: GovernanceConfig,
  transferAuthority: boolean,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  client?: VotingClient
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []
  let governanceAddress
  const governanceAuthority = walletPubkey

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

  switch (governanceType) {
    case GovernanceType.Program: {
      governanceAddress = await withCreateProgramGovernance(
        instructions,
        programId,
        programVersion,
        realm.pubkey,
        governedAccount,
        config,
        transferAuthority!,
        walletPubkey,
        tokenOwnerRecord.pubkey,
        walletPubkey,
        governanceAuthority,
        plugin?.voterWeightPk
      )
      break
    }
    default: {
      throw new Error(`Governance type ${governanceType} is not supported yet.`)
    }
  }

  const transaction = new Transaction()
  transaction.add(...instructions)
  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Creating governance program account',
    successMessage: 'Governance program account has been created',
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
