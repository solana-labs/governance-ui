import * as IT from 'io-ts';
import { gql } from 'urql';

import { BigNumber } from '@hub/types/decoders/BigNumber';
import { GovernanceTokenType } from '@hub/types/decoders/GovernanceTokenType';
import { GovernanceVoteTipping } from '@hub/types/decoders/GovernanceVoteTipping';
import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getRealm = gql`
  query($realmUrlId: String!) {
    me {
      publicKey
    }
    realmByUrlId(urlId: $realmUrlId) {
      iconUrl
      name
      publicKey
    }
  }
`;

export const getGovernance = gql`
  query($realmUrlId: String!, $governancePublicKey: PublicKey!) {
    realmByUrlId(urlId: $realmUrlId) {
      publicKey
      governance(governance: $governancePublicKey) {
        communityTokenRules {
          canCreateProposal
          canVeto
          canVote
          quorumPercent
          tokenMintAddress
          tokenMintDecimals
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
          tokenMintAddress
          tokenMintDecimals
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
  tokenMintAddress: PublicKey,
  tokenMintDecimals: BigNumber,
  tokenType: GovernanceTokenType,
  totalSupply: BigNumber,
  vetoQuorumPercent: IT.number,
  voteTipping: GovernanceVoteTipping,
  votingPowerToCreateProposals: BigNumber,
});

export const getRealmResp = IT.type({
  me: IT.union([
    IT.null,
    IT.type({
      publicKey: PublicKey,
    }),
  ]),
  realmByUrlId: IT.type({
    iconUrl: IT.union([IT.null, IT.string]),
    name: IT.string,
    publicKey: PublicKey,
  }),
});

export const getGovernanceResp = IT.type({
  realmByUrlId: IT.type({
    publicKey: PublicKey,
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
