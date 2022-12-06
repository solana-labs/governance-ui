import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getRealm = gql`
  query getRealm($realm: PublicKey!) {
    hub(realm: $realm) {
      twitterFollowerCount
    }
  }
`;

export const followedRealms = gql`
  query {
    me {
      publicKey
      followedRealms {
        displayName
        name
        publicKey
        iconUrl
        urlId
      }
    }
  }
`;

export const follow = gql`
  mutation($realm: PublicKey!) {
    followRealm(publicKey: $realm) {
      publicKey
      followedRealms {
        displayName
        name
        publicKey
        iconUrl
        urlId
      }
    }
  }
`;

export const unfollow = gql`
  mutation($realm: PublicKey!) {
    unfollowRealm(publicKey: $realm) {
      publicKey
      followedRealms {
        displayName
        name
        publicKey
        iconUrl
        urlId
      }
    }
  }
`;

export const getRealmResp = IT.type({
  hub: IT.type({
    twitterFollowerCount: IT.number,
  }),
});

export const followedRealmsResp = IT.type({
  me: IT.union([
    IT.null,
    IT.type({
      publicKey: PublicKey,
      followedRealms: IT.array(
        IT.type({
          displayName: IT.union([IT.null, IT.string]),
          name: IT.string,
          publicKey: PublicKey,
          iconUrl: IT.union([IT.null, IT.string]),
          urlId: IT.string,
        }),
      ),
    }),
  ]),
});

export const followResp = IT.type({
  followRealm: IT.type({
    publicKey: PublicKey,
    followedRealms: IT.array(
      IT.type({
        displayName: IT.union([IT.null, IT.string]),
        name: IT.string,
        publicKey: PublicKey,
        iconUrl: IT.union([IT.null, IT.string]),
        urlId: IT.string,
      }),
    ),
  }),
});

export const unfollowResp = IT.type({
  unfollowRealm: IT.type({
    publicKey: PublicKey,
    followedRealms: IT.array(
      IT.type({
        displayName: IT.union([IT.null, IT.string]),
        name: IT.string,
        publicKey: PublicKey,
        iconUrl: IT.union([IT.null, IT.string]),
        urlId: IT.string,
      }),
    ),
  }),
});
