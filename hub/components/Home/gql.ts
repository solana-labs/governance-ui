import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getRealm = gql`
  query getRealmByUrlId($urlId: String!) {
    realmByUrlId(urlId: $urlId) {
      amAdmin
      bannerImageUrl
      displayName
      iconUrl
      name
      publicKey
      shortDescription
      symbol
      twitterHandle
      websiteUrl
      githubUrl
      linkedInUrl
      discordUrl
      instagramUrl
      token {
        mint
        symbol
      }
    }
  }
`;

export const getRealmResp = IT.type({
  realmByUrlId: IT.type({
    amAdmin: IT.boolean,
    bannerImageUrl: IT.union([IT.null, IT.string]),
    displayName: IT.union([IT.null, IT.string]),
    iconUrl: IT.union([IT.null, IT.string]),
    name: IT.string,
    publicKey: PublicKey,
    shortDescription: IT.union([IT.null, IT.string, IT.undefined]),
    symbol: IT.union([IT.null, IT.string]),
    twitterHandle: IT.union([IT.null, IT.string]),
    websiteUrl: IT.union([IT.null, IT.string]),
    githubUrl: IT.union([IT.null, IT.string]),
    linkedInUrl: IT.union([IT.null, IT.string]),
    discordUrl: IT.union([IT.null, IT.string]),
    instagramUrl: IT.union([IT.null, IT.string]),
    token: IT.union([
      IT.null,
      IT.type({
        mint: PublicKey,
        symbol: IT.string,
      }),
    ]),
  }),
});
