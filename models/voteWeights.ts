import BN from 'bn.js'
import { MintInfo } from '@solana/spl-token'
import BigNumber from 'bignumber.js'
import {
  GovernanceConfig,
  MintMaxVoteWeightSource,
  Proposal,
  Realm,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

interface VoterWeightInterface {
  votingPower?: BN
  communityTokenRecord?: ProgramAccount<TokenOwnerRecord> | undefined
  councilTokenRecord?: ProgramAccount<TokenOwnerRecord> | undefined
  hasAnyWeight: () => boolean
  getTokenRecord: () => PublicKey
  hasMinCommunityWeight: (minCommunityWeight: BN) => boolean | undefined
  hasMinCouncilWeight: (minCouncilWeight: BN) => boolean | undefined
  canCreateProposal: (config: GovernanceConfig) => boolean | undefined
  canCreateGovernanceUsingCommunityTokens: (
    realm: ProgramAccount<Realm>
  ) => boolean | undefined
  canCreateGovernanceUsingCouncilTokens: () => boolean | undefined
  canCreateGovernance: (realm: ProgramAccount<Realm>) => boolean | undefined
  getTokenRecordToCreateProposal: (
    config: GovernanceConfig
  ) => ProgramAccount<TokenOwnerRecord>
  hasMinAmountToVote: (mintPk: PublicKey) => boolean | undefined
}

/// VoterWeight encapsulates logic to determine voter weights from token records (community or council)
export class VoteRegistryVoterWeight implements VoterWeightInterface {
  //TODO implement council
  communityTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined
  councilTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined
  votingPower: BN

  constructor(
    communityTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
    votingPower: BN
  ) {
    this.communityTokenRecord = communityTokenRecord
    this.councilTokenRecord = undefined
    this.votingPower = votingPower
  }

  // Checks if the voter has any voting weight
  hasAnyWeight() {
    return !this.votingPower.isZero()
  }

  // Returns first available tokenRecord
  getTokenRecord() {
    if (this.communityTokenRecord) {
      return this.communityTokenRecord.pubkey
    }

    throw new Error('Current wallet has no Token Owner Records')
  }

  hasMinCommunityWeight(minCommunityWeight: BN) {
    return (
      this.communityTokenRecord && this.votingPower.cmp(minCommunityWeight) >= 0
    )
  }
  hasMinCouncilWeight() {
    return false
  }

  canCreateProposal(config: GovernanceConfig) {
    return this.hasMinCommunityWeight(config.minCommunityTokensToCreateProposal)
  }
  canCreateGovernanceUsingCommunityTokens(realm: ProgramAccount<Realm>) {
    return this.hasMinCommunityWeight(
      realm.account.config.minCommunityTokensToCreateGovernance
    )
  }
  canCreateGovernanceUsingCouncilTokens() {
    return false
  }
  canCreateGovernance(realm: ProgramAccount<Realm>) {
    return (
      this.canCreateGovernanceUsingCommunityTokens(realm) ||
      this.canCreateGovernanceUsingCouncilTokens()
    )
  }
  hasMinAmountToVote(mintPk: PublicKey) {
    const isCommunity =
      this.communityTokenRecord?.account.governingTokenMint.toBase58() ===
      mintPk.toBase58()
    const isCouncil =
      this.councilTokenRecord?.account.governingTokenMint.toBase58() ===
      mintPk.toBase58()
    if (isCouncil) {
      return false
    }
    if (isCommunity) {
      return !this.votingPower.isZero()
    }
  }

  getTokenRecordToCreateProposal(config: GovernanceConfig) {
    // Prefer community token owner record as proposal owner
    if (this.hasMinCommunityWeight(config.minCommunityTokensToCreateProposal)) {
      return this.communityTokenRecord!
    }
    throw new Error('Not enough vote weight to create proposal')
  }
}

export class VoterWeight implements VoterWeightInterface {
  communityTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined
  councilTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined
  //votingPower used only with plugin
  votingPower?: BN | undefined

  constructor(
    communityTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
    councilTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined
  ) {
    this.communityTokenRecord = communityTokenRecord
    this.councilTokenRecord = councilTokenRecord
  }

  // Checks if the voter has any voting weight
  hasAnyWeight() {
    return (
      !this.communityTokenRecord?.account.governingTokenDepositAmount.isZero() ||
      !this.councilTokenRecord?.account.governingTokenDepositAmount.isZero()
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

  hasMinCommunityWeight(minCommunityWeight: BN) {
    return (
      this.communityTokenRecord &&
      this.communityTokenRecord.account.governingTokenDepositAmount.cmp(
        minCommunityWeight
      ) >= 0
    )
  }
  hasMinCouncilWeight(minCouncilWeight: BN) {
    return (
      this.councilTokenRecord &&
      this.councilTokenRecord.account.governingTokenDepositAmount.cmp(
        minCouncilWeight
      ) >= 0
    )
  }

  canCreateProposal(config: GovernanceConfig) {
    return (
      this.hasMinCommunityWeight(config.minCommunityTokensToCreateProposal) ||
      this.hasMinCouncilWeight(config.minCouncilTokensToCreateProposal)
    )
  }
  canCreateGovernanceUsingCommunityTokens(realm: ProgramAccount<Realm>) {
    return this.hasMinCommunityWeight(
      realm.account.config.minCommunityTokensToCreateGovernance
    )
  }
  canCreateGovernanceUsingCouncilTokens() {
    return (
      this.councilTokenRecord &&
      !this.councilTokenRecord.account.governingTokenDepositAmount.isZero()
    )
  }
  canCreateGovernance(realm: ProgramAccount<Realm>) {
    return (
      this.canCreateGovernanceUsingCommunityTokens(realm) ||
      this.canCreateGovernanceUsingCouncilTokens()
    )
  }
  hasMinAmountToVote(mintPk: PublicKey) {
    const isCommunity =
      this.communityTokenRecord?.account.governingTokenMint.toBase58() ===
      mintPk.toBase58()
    const isCouncil =
      this.councilTokenRecord?.account.governingTokenMint.toBase58() ===
      mintPk.toBase58()
    if (isCouncil) {
      return !this.councilTokenRecord?.account.governingTokenDepositAmount.isZero()
    }
    if (isCommunity) {
      return !this.communityTokenRecord?.account.governingTokenDepositAmount.isZero()
    }
  }

  getTokenRecordToCreateProposal(config: GovernanceConfig) {
    // Prefer community token owner record as proposal owner
    if (this.hasMinCommunityWeight(config.minCommunityTokensToCreateProposal)) {
      return this.communityTokenRecord!
    }
    if (this.hasMinCouncilWeight(config.minCouncilTokensToCreateProposal)) {
      return this.councilTokenRecord!
    }

    throw new Error('Not enough vote weight to create proposal')
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
