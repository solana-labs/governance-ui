import {
  GovernanceConfig,
  VoteThresholdPercentage,
  VoteTipping,
} from '@solana/spl-governance'
import { BN } from '@project-serum/anchor'
import {
  getMintNaturalAmountFromDecimal,
  getTimestampFromDays,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { U64_MAX } from '@marinade.finance/marinade-ts-sdk/dist/src/util'

export interface GovernanceConfigValues {
  minTokensToCreateProposal: number | string
  minInstructionHoldUpTime: number
  maxVotingTime: number
  voteThresholdPercentage: number
  mintDecimals: number
  voteTipping?: VoteTipping
}

// Parses min tokens to create (proposal or governance)
export function parseMinTokensToCreate(
  value: string | number,
  mintDecimals: number
) {
  return typeof value === 'string'
    ? parseMintNaturalAmountFromDecimal(value, mintDecimals)
    : getMintNaturalAmountFromDecimal(value, mintDecimals)
}

export function getGovernanceConfig(values: GovernanceConfigValues) {
  const minTokensToCreateProposal = new BN(values.minTokensToCreateProposal).eq(
    U64_MAX
  )
    ? values.minTokensToCreateProposal
    : parseMinTokensToCreate(
        values.minTokensToCreateProposal,
        values.mintDecimals
      )
  return new GovernanceConfig({
    voteThresholdPercentage: new VoteThresholdPercentage({
      value: values.voteThresholdPercentage,
    }),
    minCommunityTokensToCreateProposal: new BN(
      minTokensToCreateProposal.toString()
    ),
    minInstructionHoldUpTime: getTimestampFromDays(
      values.minInstructionHoldUpTime
    ),
    maxVotingTime: getTimestampFromDays(values.maxVotingTime),
    // Use 1 as default for council tokens.
    // Council tokens are rare and possession of any amount of council tokens should be sufficient to be allowed to create proposals
    // If it turns to be a wrong assumption then it should be exposed in the UI
    minCouncilTokensToCreateProposal: new BN(1),
    voteTipping: values.voteTipping || 0,
  })
}
