import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getPerms = gql`
  query {
    me {
      amSiteAdmin
      publicKey
    }
  }
`;

export const getPermsResp = IT.type({
  me: IT.union([
    IT.null,
    IT.type({
      amSiteAdmin: IT.union([IT.null, IT.boolean]),
      publicKey: PublicKey,
    }),
  ]),
});
