import { PublicKey } from '@solana/web3.js'

import {
  booleanFilter,
  getGovernanceAccounts,
  TokenOwnerRecord,
  VoteRecord,
} from '@solana/spl-governance'

import { pubkeyFilter } from '@solana/spl-governance'
import { mapFromEntries } from '@tools/core/script'

// TokenOwnerRecords
export async function getTokenOwnerRecordsByTokenOwner(
  programId: PublicKey,
  endpoint: string,
  realmId: PublicKey,
  governingTokenMintPk: PublicKey | undefined
) {
  return governingTokenMintPk
    ? getGovernanceAccounts(endpoint, programId, TokenOwnerRecord, [
        pubkeyFilter(1, realmId)!,
        pubkeyFilter(1 + 32, governingTokenMintPk)!,
      ]).then((tors) =>
        mapFromEntries(tors, ([_k, v]) => [
          v.account.governingTokenOwner.toBase58(),
          v,
        ])
      )
    : undefined
}

// VoteRecords

export async function getUnrelinquishedVoteRecords(
  programId: PublicKey,
  endpoint: string,
  tokenOwnerRecordPk: PublicKey
) {
  return getGovernanceAccounts(endpoint, programId, VoteRecord, [
    pubkeyFilter(1 + 32, tokenOwnerRecordPk)!,
    booleanFilter(1 + 32 + 32, false),
  ])
}
