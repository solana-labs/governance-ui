import * as IT from 'io-ts';
import { gql } from 'urql';

const VerifyWalletResponse = IT.type({
  status: IT.string,
});

export const verifyWallet = gql`
  mutation {
    verifyWallet($code: String!) {
      status
    }
  }
`;

export const verifyWalletResp = IT.type({
  verifyWallet: VerifyWalletResponse,
});
