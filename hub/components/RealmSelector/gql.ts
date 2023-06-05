import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getRealmsList = gql`
  query realmDropdownList {
    realmDropdownList {
      name
      publicKey
      iconUrl
      urlId
    }
  }
`;

export const getRealmsListResp = IT.type({
  realmDropdownList: IT.array(
    IT.type({
      name: IT.string,
      publicKey: PublicKey,
      iconUrl: IT.union([IT.null, IT.string]),
      urlId: IT.string,
    }),
  ),
});
