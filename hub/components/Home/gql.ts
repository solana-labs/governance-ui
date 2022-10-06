import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getRealm = gql`
  query getRealm($realm: PublicKey!) {
    hub(realm: $realm) {
      realm
      info {
        token {
          mint
          price
          symbol
        }
      }
    }
    realm(publicKey: $realm) {
      bannerImageUrl
      iconUrl
      name
      publicKey
      shortDescription
      symbol
      twitterHandle
      websiteUrl
    }
  }
`;

export const getRealmResp = IT.type({
  hub: IT.type({
    realm: PublicKey,
    info: IT.type({
      token: IT.union([
        IT.null,
        IT.type({
          mint: PublicKey,
          price: IT.number,
          symbol: IT.string,
        }),
      ]),
    }),
  }),
  realm: IT.type({
    bannerImageUrl: IT.union([IT.null, IT.string]),
    iconUrl: IT.union([IT.null, IT.string]),
    name: IT.string,
    publicKey: PublicKey,
    shortDescription: IT.union([IT.null, IT.string, IT.undefined]),
    symbol: IT.union([IT.null, IT.string]),
    twitterHandle: IT.union([IT.null, IT.string]),
    websiteUrl: IT.union([IT.null, IT.string]),
  }),
});
