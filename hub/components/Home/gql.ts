import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getRealm = gql`
  query getRealm($realm: PublicKey!) {
    realm(publicKey: $realm) {
      bannerImageUrl
      iconUrl
      membersCount
      name
      publicKey
      symbol
      twitterHandle
      websiteUrl
    }
  }
`;

export const getRealmResp = IT.type({
  realm: IT.type({
    bannerImageUrl: IT.union([IT.null, IT.string]),
    iconUrl: IT.union([IT.null, IT.string]),
    membersCount: IT.number,
    name: IT.string,
    publicKey: PublicKey,
    symbol: IT.union([IT.null, IT.string]),
    twitterHandle: IT.union([IT.null, IT.string]),
    websiteUrl: IT.union([IT.null, IT.string]),
  }),
});
