import {
  createSetGovernanceConfig,
  GovernanceConfig,
  Realm,
  VoteThresholdType,
  VoteTipping,
} from '@solana/spl-governance';
import type { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

import { GovernanceVoteTipping } from '@hub/types/GovernanceVoteTipping';

import { MAX_NUM } from './constants';

import { Rules } from './types';
import queryClient from '@hooks/queries/queryClient';
import { fetchGovernanceAccountByPubkey } from '@hooks/queries/governanceAccount';
import { fetchMintInfoByPubkey } from '@hooks/queries/mintInfo';
import BigNumber from 'bignumber.js';

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

export async function createTransaction(
  connection: Connection,
  programId: PublicKey,
  programVersion: number,
  governance: PublicKey,
  realmPk: PublicKey,
  rules: Rules,
) {
  const newConfig = await rules2governanceConfig(connection, realmPk, rules);

  const instruction = createSetGovernanceConfig(
    programId,
    programVersion,
    governance,
    newConfig,
  );

  return instruction;
}

export async function rules2governanceConfig(
  connection: Connection,
  realmPk: PublicKey,
  rules: Omit<Rules, 'governanceAddress' | 'walletAddress'>,
) {
  const realm = await fetchGovernanceAccountByPubkey(
    connection,
    Realm,
    'Realm',
    realmPk,
  );
  if (!realm.result) throw new Error('realm fetch failed');
  const communityMintInfo = await fetchMintInfoByPubkey(
    connection,
    realm.result.account.communityMint,
  );
  const councilMintInfo =
    realm.result.account.config.councilMint !== undefined
      ? await fetchMintInfoByPubkey(
          connection,
          realm.result.account.config.councilMint,
        )
      : undefined;

  const communityRules = rules.communityTokenRules;
  const councilRules = rules.councilTokenRules;

  const minCommunityTokensToCreateProposal = new BN(
    (communityRules.canCreateProposal
      ? communityRules.votingPowerToCreateProposals.shiftedBy(
          communityMintInfo.result?.decimals ??
            (() => {
              throw new Error('communityMintInfo failed to fetch');
            })(),
        )
      : MAX_NUM
    ).toString(),
  );

  const minCouncilTokensToCreateProposal = new BN(
    (councilRules && councilRules.canCreateProposal
      ? councilRules.votingPowerToCreateProposals.shiftedBy(
          councilMintInfo?.result?.decimals ??
            (() => {
              throw new Error(
                'councilMintInfo failed to fetch or doesnt exist',
              );
            })(),
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
