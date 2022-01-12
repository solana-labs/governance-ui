import { Connection, PublicKey } from '@solana/web3.js'

import {
  getAccountTypes,
  getGovernanceAccounts,
  getGovernanceSchemaForAccount,
  Governance,
  GovernanceAccount,
  GovernanceAccountClass,
  Proposal,
  Realm,
  TokenOwnerRecord,
  VoteRecord,
} from '@solana/spl-governance'

import { ProgramAccount } from '@solana/spl-governance'
import {
  getBorshProgramAccounts,
  MemcmpFilter,
  pubkeyFilter,
} from '@solana/spl-governance'
import { BorshAccountParser } from '@solana/spl-governance'
import { mapFromEntries } from '../tools/core/script'

export const booleanFilter = (offset: number, value: boolean) =>
  new MemcmpFilter(offset, Buffer.from(value ? [1] : [0]))

// VoteRecords

export async function getUnrelinquishedVoteRecords(
  programId: PublicKey,
  endpoint: string,
  tokenOwnerRecordPk: PublicKey
) {
  return getGovernanceAccounts<VoteRecord>(
    programId,
    endpoint,
    VoteRecord,
    getAccountTypes(VoteRecord),
    [
      pubkeyFilter(1 + 32, tokenOwnerRecordPk)!,
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
        [pubkeyFilter(1, realmId)!, pubkeyFilter(1 + 32, governingTokenMintPk)!]
      ).then((tors) =>
        mapFromEntries(tors, ([_k, v]) => [
          v.account.governingTokenOwner.toBase58(),
          v,
        ])
      )
    : undefined
}

// Governances
export async function getGovernance(
  connection: Connection,
  governancePk: PublicKey
) {
  return getGovernanceAccount<Governance>(connection, governancePk, Governance)
}

// Proposal
export async function getProposal(
  connection: Connection,
  proposalPk: PublicKey
) {
  return getGovernanceAccount<Proposal>(connection, proposalPk, Proposal)
}

// Realms

export async function getRealm(connection: Connection, realmPk: PublicKey) {
  return getGovernanceAccount<Realm>(connection, realmPk, Realm)
}

export async function getRealms(programId: PublicKey, endpoint: string) {
  return getBorshProgramAccounts<Realm>(
    programId,
    (at) => getGovernanceSchemaForAccount(at),
    endpoint,
    Realm
  )
}

export async function getGovernanceAccount<TAccount extends GovernanceAccount>(
  connection: Connection,
  accountPubKey: PublicKey,
  accountClass: GovernanceAccountClass
) {
  const accountInfo = await connection.getAccountInfo(accountPubKey)

  if (!accountInfo) {
    throw new Error(
      `Account ${accountPubKey} of type ${accountClass.name} not found`
    )
  }

  const account = BorshAccountParser(accountClass, (at) =>
    getGovernanceSchemaForAccount(at)
  )(accountPubKey, accountInfo)

  return account as ProgramAccount<TAccount>
}
