import { PublicKey } from '@solana/web3.js';

import BigNumber from 'bignumber.js';

import { Rules } from '../EditWalletRules/types';
import { GovernanceTokenType } from '@hub/types/GovernanceTokenType';
import { GovernanceVoteTipping } from '@hub/types/GovernanceVoteTipping';

const useGovernanceDefaults = (): Omit<
  Rules,
  'governanceAddress' | 'walletAddress'
> => {
  return {
    communityTokenRules: {
      canCreateProposal: true,
      canVeto: false,
      canVote: false,
      quorumPercent: 1,
      // this isn't a valid value, but it's just to satisfy the types for the
      // default initialized value
      tokenMintAddress: new PublicKey(0),
      tokenMintDecimals: new BigNumber(0),
      tokenType: GovernanceTokenType.Community,
      totalSupply: new BigNumber(1),
      vetoQuorumPercent: 100,
      voteTipping: GovernanceVoteTipping.Disabled,
      votingPowerToCreateProposals: new BigNumber(1),
    },
    councilTokenRules: {
      canCreateProposal: true,
      canVeto: false,
      canVote: false,
      quorumPercent: 1,
      // this isn't a valid value, but it's just to satisfy the types for the
      // default initialized value
      tokenMintAddress: new PublicKey(0),
      tokenMintDecimals: new BigNumber(0),
      tokenType: GovernanceTokenType.Community,
      totalSupply: new BigNumber(1),
      vetoQuorumPercent: 100,
      voteTipping: GovernanceVoteTipping.Disabled,
      votingPowerToCreateProposals: new BigNumber(1),
    },
    coolOffHours: 12,
    depositExemptProposalCount: 10,
    maxVoteDays: 3,
    minInstructionHoldupDays: 0,
    version: 3,
  };
};

export default useGovernanceDefaults;
