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

function daysToSeconds(days: number) {
  return days * 24 * 60 * 60;
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
  const newConfig = new GovernanceConfig({
    communityVoteThreshold: rules.communityTokenRules.canVote
      ? {
          type: VoteThresholdType.QuorumPercentage,
          value: rules.communityTokenRules.quorumPercent,
        }
      : {
          type: VoteThresholdType.Disabled,
          value: undefined,
        },
    minCommunityTokensToCreateProposal: rules.communityTokenRules
      .canCreateProposal
      ? new BN(
          rules.communityTokenRules.votingPowerToCreateProposals.toString(),
        )
      : new BN(MAX_NUM.toString()),
    minInstructionHoldUpTime: daysToSeconds(rules.minInstructionHoldupDays),
    maxVotingTime: daysToSeconds(rules.maxVoteDays),
    communityVoteTipping: convertVoteTipping(
      rules.communityTokenRules.voteTipping,
    ),
    minCouncilTokensToCreateProposal:
      rules.councilTokenRules && rules.councilTokenRules.canCreateProposal
        ? new BN(
            rules.councilTokenRules.votingPowerToCreateProposals.toString(),
          )
        : new BN(MAX_NUM.toString()),
    councilVoteThreshold: rules.councilTokenRules?.canVote
      ? {
          type: VoteThresholdType.QuorumPercentage,
          value: rules.councilTokenRules.quorumPercent,
        }
      : {
          type: VoteThresholdType.Disabled,
          value: undefined,
        },
    councilVetoVoteThreshold: rules.councilTokenRules?.canVeto
      ? {
          type: VoteThresholdType.QuorumPercentage,
          value: rules.councilTokenRules.vetoQuorumPercent,
        }
      : {
          type: VoteThresholdType.Disabled,
          value: undefined,
        },
    communityVetoVoteThreshold: rules.communityTokenRules.canVeto
      ? {
          type: VoteThresholdType.QuorumPercentage,
          value: rules.communityTokenRules.vetoQuorumPercent,
        }
      : {
          type: VoteThresholdType.Disabled,
          value: undefined,
        },
    councilVoteTipping: rules.councilTokenRules
      ? convertVoteTipping(rules.councilTokenRules.voteTipping)
      : VoteTipping.Disabled,
    votingCoolOffTime: daysToSeconds(rules.coolOffHours),
    depositExemptProposalCount: rules.depositExemptProposalCount,
  });

  const instruction = createSetGovernanceConfig(
    programId,
    programVersion,
    governance,
    newConfig,
  );

  return instruction;
}
