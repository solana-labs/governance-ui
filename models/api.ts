import { Connection, PublicKey } from '@solana/web3.js'

import {
  booleanFilter,
  getGovernanceAccounts,
  VoteRecord,
  Proposal
} from '@solana/spl-governance'

import { pubkeyFilter, MemcmpFilter } from '@solana/spl-governance'
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

// Proposals

export async function getProposalsAtVotingStateByTOR(
  connection: Connection,
  programId: PublicKey,
  tokenOwnerRecordPk: PublicKey
) {

  const enumFilter: MemcmpFilter = new MemcmpFilter(65, Buffer.from(Uint8Array.from([2])))

  return getGovernanceAccounts(connection, programId, Proposal, [
    enumFilter,
    pubkeyFilter(1 + 32 + 32 + 1, tokenOwnerRecordPk)!
  ])
}