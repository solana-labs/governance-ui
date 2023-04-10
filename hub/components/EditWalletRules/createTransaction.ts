import {
  createSetGovernanceConfig,
  GovernanceConfig,
  VoteThresholdType,
  VoteTipping,
} from '@solana/spl-governance';
import type { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

import { GovernanceVoteTipping } from '@hub/types/GovernanceVoteTipping';

import { MAX_NUM } from './constants';

import { Rules } from './types';

function hoursToSeconds(hours: number) {
  return hours * 60 * 60;
}

function daysToSeconds(days: number) {
  return hoursToSeconds(days * 24);
}

function convertVoteTipping(tipping: GovernanceVoteTipping): VoteTipping {
  switch (tipping) {
    case GovernanceVoteTipping.Disabled:
      return VoteTipping.Disabled;
    case GovernanceVoteTipping.Early:
      return VoteTipping.Early;
    case GovernanceVoteTipping.Strict:
      return VoteTipping.Strict;
  }
}

export function createTransaction(
  programId: PublicKey,
  programVersion: number,
  governance: PublicKey,
  rules: Rules,
) {
  const newConfig = rules2governanceConfig(rules);

  const instruction = createSetGovernanceConfig(
    programId,
    programVersion,
    governance,
    newConfig,
  );

  return instruction;
}

export function rules2governanceConfig(rules: Rules) {
  const communityRules = rules.communityTokenRules;
  const councilRules = rules.councilTokenRules;
  const minCommunityTokensToCreateProposal = new BN(
    (communityRules.canCreateProposal
      ? communityRules.votingPowerToCreateProposals.shiftedBy(
          communityRules.tokenMintDecimals.toNumber(),
        )
      : MAX_NUM
    ).toString(),
  );

  const minCouncilTokensToCreateProposal = new BN(
    (councilRules && councilRules.canCreateProposal
      ? councilRules.votingPowerToCreateProposals.shiftedBy(
          councilRules.tokenMintDecimals.toNumber(),
        )
      : MAX_NUM
    ).toString(),
  );

  const newConfig = new GovernanceConfig({
    minCommunityTokensToCreateProposal,
    minCouncilTokensToCreateProposal,
    communityVoteThreshold: communityRules.canVote
      ? {
          type: VoteThresholdType.YesVotePercentage,
          value: communityRules.quorumPercent,
        }
      : {
          type: VoteThresholdType.Disabled,
          value: undefined,
        },
    minInstructionHoldUpTime: daysToSeconds(rules.minInstructionHoldupDays),
    baseVotingTime:
      daysToSeconds(rules.maxVoteDays) - hoursToSeconds(rules.coolOffHours),
    communityVoteTipping: convertVoteTipping(communityRules.voteTipping),
    councilVoteThreshold: councilRules?.canVote
      ? {
          type: VoteThresholdType.YesVotePercentage,
          value: councilRules.quorumPercent,
        }
      : {
          type: VoteThresholdType.Disabled,
          value: undefined,
        },
    councilVetoVoteThreshold: councilRules?.canVeto
      ? {
          type: VoteThresholdType.YesVotePercentage,
          value: councilRules.vetoQuorumPercent,
        }
      : {
          type: VoteThresholdType.Disabled,
          value: undefined,
        },
    communityVetoVoteThreshold: communityRules.canVeto
      ? {
          type: VoteThresholdType.YesVotePercentage,
          value: communityRules.vetoQuorumPercent,
        }
      : {
          type: VoteThresholdType.Disabled,
          value: undefined,
        },
    councilVoteTipping: councilRules
      ? convertVoteTipping(councilRules.voteTipping)
      : VoteTipping.Disabled,
    votingCoolOffTime: hoursToSeconds(rules.coolOffHours),
    depositExemptProposalCount: rules.depositExemptProposalCount,
  });
  return newConfig;
}
