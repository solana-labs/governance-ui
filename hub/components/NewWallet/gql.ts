import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getGovernanceRules = gql`
  query($realmUrlId: String!, $governancePublicKey: PublicKey!) {
    me {
      publicKey
    }
    realmByUrlId(urlId: $realmUrlId) {
      programPublicKey
      publicKey
    }
  }
`;

export const getGovernanceRulesResp = IT.type({
  me: IT.union([
    IT.null,
    IT.type({
      publicKey: PublicKey,
    }),
  ]),
  realmByUrlId: IT.type({
    programPublicKey: PublicKey,
    publicKey: PublicKey,
  }),
});
