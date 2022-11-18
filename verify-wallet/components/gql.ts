import * as IT from 'io-ts';
import { gql } from 'urql';

const VerifyWalletResponse = IT.type({
  publicKey: IT.string,
});

export const verifyWallet = gql`
  mutation($code: String!) {
    verifyWallet(code: $code) {
      publicKey
    }
  }
`;

export const verifyWalletResp = IT.type({
  verifyWallet: VerifyWalletResponse,
});
