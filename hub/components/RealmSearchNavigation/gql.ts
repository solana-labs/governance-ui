import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getRealmsList = gql`
  query realmDropdownList {
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
    realmDropdownList {
      displayName
      name
      publicKey
      iconUrl
      urlId
    }
  }
`;

export const getRealmsListResp = IT.type({
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
  realmDropdownList: IT.array(
    IT.type({
      displayName: IT.union([IT.null, IT.string]),
      name: IT.string,
      publicKey: PublicKey,
      iconUrl: IT.union([IT.null, IT.string]),
      urlId: IT.string,
    }),
  ),
});
