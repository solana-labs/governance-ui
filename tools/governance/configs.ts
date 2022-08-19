import {
  PROGRAM_VERSION_V3,
  VoteThreshold,
  VoteThresholdType,
} from '@solana/spl-governance'

export function createGovernanceThresholds(
  programVersion: number,
  communityYesVotePercentage: number
) {
  const communityVoteThreshold = new VoteThreshold({
    value: communityYesVotePercentage,
    type: VoteThresholdType.YesVotePercentage,
  })

  // For backward compatybility with spl-gov versions <= 2
  // for Council vote and Veto vote thresholds we have to pass YesVotePerentage(0)
  const undefinedThreshold = new VoteThreshold({
    type: VoteThresholdType.YesVotePercentage,
    value: 0,
  })

  // TODO: For spl-gov v3 add suport for seperate council vote threshold in the UI
  // Until it's supported we default it to community vote threshold
  const councilVoteThreshold =
    programVersion >= PROGRAM_VERSION_V3
      ? communityVoteThreshold
      : undefinedThreshold

  // TODO: For spl-gov v3 add suport for seperate council Veto vote threshold in the UI
  // Until it's supported we default it to community vote threshold
  const councilVetoVoteThreshold =
    programVersion >= PROGRAM_VERSION_V3
      ? communityVoteThreshold
      : undefinedThreshold

  return {
    communityVoteThreshold,
    councilVoteThreshold,
    councilVetoVoteThreshold,
  }
}
