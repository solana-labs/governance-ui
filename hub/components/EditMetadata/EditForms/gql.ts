import * as IT from 'io-ts';
import { gql } from 'urql';

export const checkSymbol = gql`
  query checkSymbol($realm: PublicKey!, $symbol: String!) {
    canAssignSymbolToRealm(realm: $realm, symbol: $symbol)
  }
`;

export const checkSymbolResp = IT.type({
  canAssignSymbolToRealm: IT.boolean,
});
