import * as IT from 'io-ts';
import { gql } from 'urql';

const VerifyWalletResponse = IT.type({
  status: IT.string,
});

export const verifyWallet = gql`
  mutation($code: String!) {
    verifyWallet(code: $code) {
      status
    }
  }
`;

export const verifyWalletResp = IT.type({
  verifyWallet: VerifyWalletResponse,
});
