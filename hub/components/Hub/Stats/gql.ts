import * as IT from 'io-ts';
import { gql } from 'urql';

import { BigNumber } from '@hub/types/decoders/BigNumber';
import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getTreasuryValue = gql`
  query getTreasuryValue($realm: PublicKey!) {
    realmTreasury(realm: $realm) {
      belongsTo
      totalValue
    }
  }
`;

export const getTreasuryValueResp = IT.type({
  realmTreasury: IT.type({
    belongsTo: PublicKey,
    totalValue: BigNumber,
  }),
});
