import { GovernanceConfig, VoteThresholdType } from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';

import BigNumber from 'bignumber.js';

import BN from 'bn.js';
import { pipe } from 'fp-ts/lib/function';

import { Rules } from '../EditWalletRules/types';
import useTreasuryInfo from '@hooks/useTreasuryInfo';
import { GovernanceTokenType } from '@hub/types/GovernanceTokenType';
import { GovernanceVoteTipping } from '@hub/types/GovernanceVoteTipping';

import * as RE from '@hub/types/Result';

import { DISABLED_VOTER_WEIGHT } from '@tools/constants';

const configs2defaults = (configs: GovernanceConfig[]) => {
  // community ---
  const disableCommunityVote =
    configs.find(
      (x) => x.communityVoteThreshold.type === VoteThresholdType.Disabled,
    ) !== undefined;
  const highestCommunityThreshold = Math.max(
    ...configs.map((x) => x.communityVoteThreshold.value ?? 0),
  );

  const disableCommunityVetoVote =
    configs.find(
      (x) => x.communityVetoVoteThreshold.type === VoteThresholdType.Disabled,
    ) !== undefined;
  const highestCommunityVetoVoteThreshold = Math.max(
    ...configs.map((x) => x.communityVetoVoteThreshold.value ?? 0),
  );

  const highestMinCommunityTokensToCreateProposal = configs.reduce(
    (acc, x) => BN.max(acc, x.minCommunityTokensToCreateProposal),
    new BN(0),
  );

  // council ---
  const disableCouncilVote =
    configs.find(
      (x) => x.councilVoteThreshold.type === VoteThresholdType.Disabled,
    ) !== undefined;
  const highestCouncilThreshold = Math.max(
    ...configs.map((x) => x.councilVoteThreshold.value ?? 0),
  );

  const disableCouncilVetoVote =
    configs.find(
      (x) => x.councilVetoVoteThreshold.type === VoteThresholdType.Disabled,
    ) !== undefined;
  const highestCouncilVetoVoteThreshold = Math.max(
    ...configs.map((x) => x.councilVetoVoteThreshold.value ?? 0),
  );

  const highestMinCouncilTokensToCreateProposal = configs.reduce(
    (acc, x) => BN.max(acc, x.minCouncilTokensToCreateProposal),
    new BN(0),
  );

  const x: Omit<Rules, 'governanceAddress' | 'walletAddress'> = {
    communityTokenRules: {
      canCreateProposal: !highestMinCommunityTokensToCreateProposal.eq(
        DISABLED_VOTER_WEIGHT,
      ),
      votingPowerToCreateProposals: new BigNumber(
        highestMinCommunityTokensToCreateProposal.toString(),
      ),
      // START totally fake dummy values 💀
      tokenMintAddress: new PublicKey(0),
      tokenMintDecimals: new BigNumber(0),
      tokenType: GovernanceTokenType.Community,
      totalSupply: new BigNumber(1),
      // END
      canVeto: !disableCommunityVetoVote,
      vetoQuorumPercent: disableCommunityVetoVote
        ? 60
        : highestCommunityVetoVoteThreshold,
      canVote: !disableCommunityVote,
      quorumPercent: disableCommunityVote ? 60 : highestCommunityThreshold,
      voteTipping: GovernanceVoteTipping.Disabled,
    },
    councilTokenRules: {
      canCreateProposal: !highestMinCouncilTokensToCreateProposal.eq(
        DISABLED_VOTER_WEIGHT,
      ),
      votingPowerToCreateProposals: new BigNumber(
        highestMinCouncilTokensToCreateProposal.toString(),
      ),
      // START totally fake dummy values 💀
      tokenMintAddress: new PublicKey(0),
      tokenMintDecimals: new BigNumber(0),
      tokenType: GovernanceTokenType.Council,
      totalSupply: new BigNumber(1),
      // END
      canVeto: !disableCouncilVetoVote,
      vetoQuorumPercent: disableCouncilVetoVote
        ? 60
        : highestCouncilVetoVoteThreshold,
      canVote: !disableCouncilVote,
      quorumPercent: disableCouncilVote ? 60 : highestCouncilThreshold,
      voteTipping: GovernanceVoteTipping.Disabled,
    },
    coolOffHours: 12,
    maxVoteDays: 3,
    depositExemptProposalCount: 10,
    minInstructionHoldupDays: 0,
    version: 3,
  };
  return x;
};

const useGovernanceDefaults = ():
  | undefined
  | Omit<Rules, 'governanceAddress' | 'walletAddress'> => {
  const data = useTreasuryInfo();
  const configs = pipe(
    data,
    RE.match(
      () => undefined,
      () => undefined,
      (y) => y.wallets.map((x) => x.governanceAccount?.account.config),
    ),
  );

  const defaults =
    configs !== undefined && !configs.find((x) => x === undefined) // I assume undefined means loading
      ? configs2defaults(configs as GovernanceConfig[]) // look typescript i PROMISE there's not any undefined members
      : undefined;

  return defaults;
};

export default useGovernanceDefaults;
