import BN from 'bn.js'
import { MintInfo } from '@solana/spl-token'
import BigNumber from 'bignumber.js'
import {
  MintMaxVoteWeightSource,
  Proposal,
  Realm,
  TokenOwnerRecord,
} from './accounts'
import { ParsedAccount } from './core/accounts'

/// VoterWeight encapsulates logic to determine voter weights from token records (community or council)
export class VoterWeight {
  communityTokenRecord: ParsedAccount<TokenOwnerRecord> | undefined
  councilTokenRecord: ParsedAccount<TokenOwnerRecord> | undefined

  constructor(
    communityTokenRecord: ParsedAccount<TokenOwnerRecord> | undefined,
    councilTokenRecord: ParsedAccount<TokenOwnerRecord> | undefined
  ) {
    this.communityTokenRecord = communityTokenRecord
    this.councilTokenRecord = councilTokenRecord
  }

  // Checks if the voter has any voting weight
  hasAnyWeight() {
    return (
      !this.communityTokenRecord?.info.governingTokenDepositAmount.isZero() ||
      !this.councilTokenRecord?.info.governingTokenDepositAmount.isZero()
    )
  }

  // Returns first available tokenRecord
  getTokenRecord() {
    if (this.communityTokenRecord) {
      return this.communityTokenRecord.pubkey
    }
    if (this.councilTokenRecord) {
      return this.councilTokenRecord.pubkey
    }

    throw new Error('Current wallet has no Token Owner Records')
  }
}

/// Returns max VoteWeight for given mint and max source
export function getMintMaxVoteWeight(
  mint: MintInfo,
  maxVoteWeightSource: MintMaxVoteWeightSource
) {
  if (maxVoteWeightSource.isFullSupply()) {
    return mint.supply
  }

  const supplyFraction = maxVoteWeightSource.getSupplyFraction()

  const maxVoteWeight = new BigNumber(supplyFraction.toString())
    .multipliedBy(mint.supply.toString())
    .shiftedBy(-MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS)

  return new BN(maxVoteWeight.dp(0, BigNumber.ROUND_DOWN).toString())
}

/// Returns max vote weight for a proposal
export function getProposalMaxVoteWeight(
  realm: Realm,
  proposal: Proposal,
  governingTokenMint: MintInfo
) {
  // For finalized proposals the max is stored on the proposal in case it can change in the future
  if (proposal.isVoteFinalized() && proposal.maxVoteWeight) {
    return proposal.maxVoteWeight
  }

  // Council votes are currently not affected by MaxVoteWeightSource
  if (
    proposal.governingTokenMint.toBase58() ===
    realm.config.councilMint?.toBase58()
  ) {
    return governingTokenMint.supply
  }

  return getMintMaxVoteWeight(
    governingTokenMint,
    realm.config.communityMintMaxVoteWeightSource
  )
}
