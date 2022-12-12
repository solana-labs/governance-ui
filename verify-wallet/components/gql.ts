import * as IT from 'io-ts';
import { gql } from 'urql';

const VerifyWalletResponse = IT.type({
  publicKey: IT.string,
});

export const verifyWallet = gql`
  mutation($code: String!, $application: DiscordApplication = SOLANA) {
    verifyWallet(code: $code, application: $application) {
      publicKey
    }
  }
`;

export const verifyWalletResp = IT.type({
  verifyWallet: VerifyWalletResponse,
});
