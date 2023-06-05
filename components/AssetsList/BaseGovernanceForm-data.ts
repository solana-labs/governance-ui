import {
  GovernanceConfig,
  VoteThresholdType,
  VoteTipping,
} from '@solana/spl-governance'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import {
  getTimestampFromDays,
  parseMintNaturalAmountFromDecimalAsBN,
  getTimestampFromHours,
} from '@tools/sdk/units'

type FormErrors<T> = {
  [P in keyof T]: Error | undefined
}

/* all token values in human-readable units */
export type BaseGovernanceFormFieldsV3 = {
  /* in days */
  minInstructionHoldUpTime: string
  /* in days */
  baseVotingTime: string

  // 'disabled' for disabled values
  minCommunityTokensToCreateProposal: string | 'disabled'
  // 'disabled' for disabled values
  minCouncilTokensToCreateProposal: string | 'disabled'
  votingCoolOffTime: string
  depositExemptProposalCount: string
  communityVoteThreshold: string | 'disabled'
  communityVetoVoteThreshold: string | 'disabled'
  councilVoteThreshold: string | 'disabled'
  councilVetoVoteThreshold: string | 'disabled'
  communityVoteTipping: VoteTipping
  councilVoteTipping: VoteTipping
  _programVersion: 3
}

type Transformer<T extends Record<keyof U, any>, U> = {
  [K in keyof U]: (x: T[K]) => U[K]
}

export const transformerBaseGovernanceFormFieldsV3_2_GovernanceConfig = (
  communityMintDecimals: number,
  councilMintDecimals: number
): Transformer<
  BaseGovernanceFormFieldsV3,
  Omit<GovernanceConfig & { _programVersion: 3 }, 'reserved'>
> => ({
  minInstructionHoldUpTime: (x) => getTimestampFromDays(parseFloat(x)),
  baseVotingTime: (x) => getTimestampFromDays(parseFloat(x)),
  minCommunityTokensToCreateProposal: (x) =>
    x === 'disabled'
      ? DISABLED_VOTER_WEIGHT
      : parseMintNaturalAmountFromDecimalAsBN(x, communityMintDecimals),
  minCouncilTokensToCreateProposal: (x) =>
    x === 'disabled'
      ? DISABLED_VOTER_WEIGHT
      : parseMintNaturalAmountFromDecimalAsBN(x, councilMintDecimals),
  communityVoteThreshold: (x) =>
    x === 'disabled'
      ? { type: VoteThresholdType.Disabled, value: undefined }
      : { type: VoteThresholdType.YesVotePercentage, value: parseInt(x) },
  communityVetoVoteThreshold: (x) =>
    x === 'disabled'
      ? { type: VoteThresholdType.Disabled, value: undefined }
      : { type: VoteThresholdType.YesVotePercentage, value: parseInt(x) },
  councilVoteThreshold: (x) =>
    x === 'disabled'
      ? { type: VoteThresholdType.Disabled, value: undefined }
      : { type: VoteThresholdType.YesVotePercentage, value: parseInt(x) },
  councilVetoVoteThreshold: (x) =>
    x === 'disabled'
      ? { type: VoteThresholdType.Disabled, value: undefined }
      : { type: VoteThresholdType.YesVotePercentage, value: parseInt(x) },
  communityVoteTipping: (x) => x,
  councilVoteTipping: (x) => x,
  votingCoolOffTime: (x) => getTimestampFromHours(parseFloat(x)),
  depositExemptProposalCount: (x) => parseFloat(x),
  _programVersion: (x) => x,
})

export const transform = <T extends Record<keyof U, any>, U>(
  transformer: Transformer<T, U>,
  data: T
): [U, FormErrors<U>] => {
  const obj = {}
  const errs = {}
  for (const [key, value] of Object.entries(data)) {
    try {
      obj[key] = transformer[key](value)
    } catch (e) {
      errs[key] = e
    }
  }
  return [obj, errs] as [U, FormErrors<U>]
}
