import { Connection, PublicKey } from '@solana/web3.js'

import {
  booleanFilter,
  getGovernanceAccounts,
  TokenOwnerRecord,
  VoteRecord,
} from '@solana/spl-governance'

import { pubkeyFilter } from '@solana/spl-governance'
import { mapFromEntries } from '@tools/core/script'

// TokenOwnerRecords
export async function getTokenOwnerRecordsForRealmMintMapByOwner(
  connection: Connection,
  programId: PublicKey,
  realmId: PublicKey,
  governingTokenMintPk: PublicKey | undefined
) {
  return governingTokenMintPk
    ? getGovernanceAccounts(connection, programId, TokenOwnerRecord, [
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
  connection: Connection,
  programId: PublicKey,
  tokenOwnerRecordPk: PublicKey
) {
  return getGovernanceAccounts(connection, programId, VoteRecord, [
    pubkeyFilter(1 + 32, tokenOwnerRecordPk)!,
    booleanFilter(1 + 32 + 32, false),
  ])
}

export async function getVoteRecordsByVoterMapByProposal(
  connection: Connection,
  programId: PublicKey,
  voter: PublicKey
) {
  return getGovernanceAccounts(connection, programId, VoteRecord, [
    pubkeyFilter(33, voter)!,
  ]).then((vrs) =>
    mapFromEntries(vrs, ([_, v]) => [v.account.proposal.toBase58(), v])
  )
}

export async function getVoteRecordsByProposalMapByVoter(
  connection: Connection,
  programId: PublicKey,
  proposalPubKey: PublicKey
) {
  return getGovernanceAccounts(connection, programId, VoteRecord, [
    pubkeyFilter(1, proposalPubKey)!,
  ]).then((vrs) =>
    mapFromEntries(vrs, ([_, v]) => [
      v.account.governingTokenOwner.toBase58(),
      v,
    ])
  )
}
