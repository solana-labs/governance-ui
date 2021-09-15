import { Connection, PublicKey } from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import {
  getAccountTypes,
  GovernanceAccount,
  GovernanceAccountClass,
  GovernanceAccountType,
  Proposal,
  Realm,
  TokenOwnerRecord,
  VoteRecord,
} from './accounts'

import { ParsedAccount } from './core/accounts'
import {
  booleanFilter,
  getBorshProgramAccounts,
  MemcmpFilter,
  pubkeyFilter,
  RpcContext,
} from './core/api'
import { BorshAccountParser } from './core/serialisation'
import { mapFromEntries } from '../tools/core/script'

// VoteRecords

export async function getUnrelinquishedVoteRecords(
  programId: PublicKey,
  endpoint: string,
  tokenOwnerRecordPk: PublicKey
) {
  return getBorshProgramAccounts<VoteRecord>(
    programId,
    GOVERNANCE_SCHEMA,
    endpoint,
    VoteRecord,
    [
      pubkeyFilter(1 + 32, tokenOwnerRecordPk),
      booleanFilter(1 + 32 + 32, false),
    ]
  )
}

// TokenOwnerRecords
export async function getTokenOwnerRecordsByTokenOwner(
  programId: PublicKey,
  endpoint: string,
  realmId: PublicKey,
  governingTokenMintPk: PublicKey | undefined
) {
  return governingTokenMintPk
    ? getGovernanceAccounts<TokenOwnerRecord>(
        programId,
        endpoint,
        TokenOwnerRecord,
        getAccountTypes(TokenOwnerRecord),
        [pubkeyFilter(1, realmId), pubkeyFilter(1 + 32, governingTokenMintPk)]
      ).then((tors) =>
        mapFromEntries(tors, ([_k, v]) => [
          v.info.governingTokenOwner.toBase58(),
          v,
        ])
      )
    : undefined
}

// Proposal
export async function getProposal(
  connection: Connection,
  proposalPk: PublicKey
) {
  return getGovernanceAccount<Proposal>(connection, proposalPk, Proposal)
}

// Realms

export async function getRealms(rpcContext: RpcContext) {
  return getBorshProgramAccounts<Realm>(
    rpcContext.programId,
    GOVERNANCE_SCHEMA,
    rpcContext.endpoint,
    Realm
  )
}

export async function getGovernanceAccounts<TAccount extends GovernanceAccount>(
  programId: PublicKey,
  endpoint: string,
  accountClass: GovernanceAccountClass,
  accountTypes: GovernanceAccountType[],
  filters: MemcmpFilter[] = []
) {
  if (accountTypes.length === 1) {
    return getBorshProgramAccounts<TAccount>(
      programId,
      GOVERNANCE_SCHEMA,
      endpoint,
      accountClass as any,
      filters,
      accountTypes[0]
    )
  }

  const all = await Promise.all(
    accountTypes.map((at) =>
      getBorshProgramAccounts<TAccount>(
        programId,
        GOVERNANCE_SCHEMA,
        endpoint,
        accountClass as any,
        filters,
        at
      )
    )
  )

  return all.reduce((res, r) => ({ ...res, ...r }), {}) as Record<
    string,
    ParsedAccount<TAccount>
  >
}

export async function getGovernanceAccount<TAccount extends GovernanceAccount>(
  connection: Connection,
  accountPubKey: PublicKey,
  accountClass: GovernanceAccountClass
) {
  const accountInfo = await connection.getAccountInfo(accountPubKey)
  const account = BorshAccountParser(accountClass, GOVERNANCE_SCHEMA)(
    accountPubKey,
    accountInfo
  )

  return account as ParsedAccount<TAccount>
}
