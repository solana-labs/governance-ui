import {
  GovernanceConfig,
  VoteThresholdType,
  VoteTipping,
} from '@solana/spl-governance'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import { isDisabledVoterWeight } from '@tools/governance/units'
import {
  getTimestampFromDays,
  getDaysFromTimestamp,
  parseMintNaturalAmountFromDecimalAsBN,
  fmtBnMintDecimalsUndelimited,
  getHoursFromTimestamp,
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
  maxVotingTime: string

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

// @agrippa I use this functional pattern instead of referencing values directly when transforming, so as to reduce surface area for typos
export const transformerGovernanceConfig_2_BaseGovernanceFormFieldsV3 = (
  communityMintDecimals: number,
  councilMintDecimals: number
): Transformer<
  GovernanceConfig & { _programVersion: 3 },
  BaseGovernanceFormFieldsV3
> => ({
  minInstructionHoldUpTime: (x) => getDaysFromTimestamp(x).toString(),
  maxVotingTime: (x) => getDaysFromTimestamp(x).toString(),
  minCommunityTokensToCreateProposal: (x) =>
    isDisabledVoterWeight(x)
      ? 'disabled'
      : fmtBnMintDecimalsUndelimited(x, communityMintDecimals),
  minCouncilTokensToCreateProposal: (x) =>
    isDisabledVoterWeight(x)
      ? 'disabled'
      : fmtBnMintDecimalsUndelimited(x, councilMintDecimals),
  communityVoteThreshold: (x) =>
    x.type === VoteThresholdType.Disabled ? 'disabled' : x.value!.toString(),
  communityVetoVoteThreshold: (x) =>
    x.type === VoteThresholdType.Disabled ? 'disabled' : x.value!.toString(),
  councilVoteThreshold: (x) =>
    x.type === VoteThresholdType.Disabled ? 'disabled' : x.value!.toString(),
  councilVetoVoteThreshold: (x) =>
    x.type === VoteThresholdType.Disabled ? 'disabled' : x.value!.toString(),
  communityVoteTipping: (x) => x,
  councilVoteTipping: (x) => x,
  votingCoolOffTime: (x) => getHoursFromTimestamp(x).toString(),
  depositExemptProposalCount: (x) => x.toString(),
  _programVersion: (x) => x,
})

export const transformerBaseGovernanceFormFieldsV3_2_GovernanceConfig = (
  communityMintDecimals: number,
  councilMintDecimals: number
): Transformer<
  BaseGovernanceFormFieldsV3,
  Omit<GovernanceConfig & { _programVersion: 3 }, 'reserved'>
> => ({
  minInstructionHoldUpTime: (x) => getTimestampFromDays(parseFloat(x)),
  maxVotingTime: (x) => getTimestampFromDays(parseFloat(x)),
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

export type BaseGovernanceFormErrorsV3 = FormErrors<
  Omit<GovernanceConfig, 'reserved'>
> & {
  _programVersion: 3
}
