import * as IT from 'io-ts';
import { gql } from 'urql';

import { BigNumber } from '@hub/types/decoders/BigNumber';
import { GovernanceTokenType } from '@hub/types/decoders/GovernanceTokenType';
import { GovernanceVoteTipping } from '@hub/types/decoders/GovernanceVoteTipping';
import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getGovernanceRules = gql`
  query($realmUrlId: String!, $governancePublicKey: PublicKey!) {
    realmByUrlId(urlId: $realmUrlId) {
      governance(governance: $governancePublicKey) {
        communityTokenRules {
          canCreateProposal
          canVeto
          canVote
          quorumPercent
          tokenType
          totalSupply
          vetoQuorumPercent
          voteTipping
          votingPowerToCreateProposals
        }
        coolOffHours
        councilTokenRules {
          canCreateProposal
          canVeto
          canVote
          quorumPercent
          tokenType
          totalSupply
          vetoQuorumPercent
          voteTipping
          votingPowerToCreateProposals
        }
        depositExemptProposalCount
        governanceAddress
        maxVoteDays
        minInstructionHoldupDays
        version
        walletAddress
      }
    }
  }
`;

const Rules = IT.type({
  canCreateProposal: IT.boolean,
  canVeto: IT.boolean,
  canVote: IT.boolean,
  quorumPercent: IT.number,
  tokenType: GovernanceTokenType,
  totalSupply: BigNumber,
  vetoQuorumPercent: IT.number,
  voteTipping: GovernanceVoteTipping,
  votingPowerToCreateProposals: BigNumber,
});

export const getGovernanceRulesResp = IT.type({
  realmByUrlId: IT.type({
    governance: IT.type({
      communityTokenRules: Rules,
      coolOffHours: IT.number,
      councilTokenRules: IT.union([IT.null, Rules]),
      depositExemptProposalCount: IT.number,
      governanceAddress: PublicKey,
      maxVoteDays: IT.number,
      minInstructionHoldupDays: IT.number,
      version: IT.number,
      walletAddress: PublicKey,
    }),
  }),
});
