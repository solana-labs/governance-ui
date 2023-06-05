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
  const enableCommunityVote =
    configs.find(
      (x) => x.communityVoteThreshold.type !== VoteThresholdType.Disabled,
    ) !== undefined;

  const highestMinCommunityTokensToCreateProposal = configs.reduce(
    (acc, x) => BN.max(acc, x.minCommunityTokensToCreateProposal),
    new BN(0),
  );

  // council ---
  const enableCouncilVote =
    configs.find(
      (x) => x.councilVoteThreshold.type !== VoteThresholdType.Disabled,
    ) !== undefined;

  const enableCouncilVetoVote =
    configs.find(
      (x) => x.councilVetoVoteThreshold.type !== VoteThresholdType.Disabled,
    ) !== undefined;

  const highestMinCouncilTokensToCreateProposal = configs.reduce(
    (acc, x) => BN.max(acc, x.minCouncilTokensToCreateProposal),
    new BN(0),
  );

  const x: Omit<Rules, 'governanceAddress' | 'walletAddress'> = {
    communityTokenRules: {
      canCreateProposal:
        enableCommunityVote &&
        !highestMinCommunityTokensToCreateProposal.eq(DISABLED_VOTER_WEIGHT),
      votingPowerToCreateProposals: new BigNumber(
        highestMinCommunityTokensToCreateProposal.toString(),
      ),
      // START totally fake dummy values 💀
      tokenMintAddress: new PublicKey(0),
      tokenMintDecimals: new BigNumber(0),
      tokenType: GovernanceTokenType.Community,
      totalSupply: new BigNumber(1),
      // END
      canVeto: false,
      vetoQuorumPercent: 60,
      canVote: enableCommunityVote,
      quorumPercent: 60,
      voteTipping: GovernanceVoteTipping.Disabled,
    },
    councilTokenRules: {
      canCreateProposal:
        enableCouncilVote &&
        !highestMinCouncilTokensToCreateProposal.eq(DISABLED_VOTER_WEIGHT),
      votingPowerToCreateProposals: new BigNumber(
        highestMinCouncilTokensToCreateProposal.toString(),
      ),
      // START totally fake dummy values 💀
      tokenMintAddress: new PublicKey(0),
      tokenMintDecimals: new BigNumber(0),
      tokenType: GovernanceTokenType.Council,
      totalSupply: new BigNumber(1),
      // END
      canVeto: enableCouncilVetoVote,
      vetoQuorumPercent: 60,
      canVote: enableCouncilVote,
      quorumPercent: 60,
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
  const data = useTreasuryInfo(false);
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
