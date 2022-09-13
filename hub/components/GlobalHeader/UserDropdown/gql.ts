import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getUser = gql`
  query {
    me {
      publicKey
      twitterInfo {
        avatarUrl
        handle
      }
    }
  }
`;

export const User = IT.type({
  publicKey: PublicKey,
  twitterInfo: IT.union([
    IT.null,
    IT.type({
      avatarUrl: IT.union([IT.null, IT.string]),
      handle: IT.string,
    }),
  ]),
});

export type User = IT.TypeOf<typeof User>;

export const getUserResp = IT.type({
  me: User,
});
