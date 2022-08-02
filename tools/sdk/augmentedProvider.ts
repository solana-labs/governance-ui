import {
  SolanaAugmentedProvider,
  SolanaProvider,
  SignerWallet,
} from '@saberhq/solana-contrib';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { Connection } from '@solana/web3.js';

export const augmentedProvider = (
  connection: Connection,
  wallet: SignerWalletAdapter,
) => {
  return new SolanaAugmentedProvider(
    SolanaProvider.init({
      connection: connection,
      wallet: (wallet as unknown) as SignerWallet,
    }),
  );
};
