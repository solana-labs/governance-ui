import { Connection, PublicKey } from '@solana/web3.js'

import {
  booleanFilter,
  getGovernanceAccounts,
  VoteRecord,
} from '@solana/spl-governance'

import { pubkeyFilter } from '@solana/spl-governance'
import { arrayToRecord } from '@tools/core/script'

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
  ]).then((vrs) => arrayToRecord(vrs, (vr) => vr.account.proposal.toBase58()))
}
