import { DialectSolanaWalletAdapter } from '@dialectlabs/react-sdk-blockchain-solana';
import { WalletContextState as SolanaWalletContextState } from '@solana/wallet-adapter-react';

export function solanaWalletToDialectWallet(
  wallet: SolanaWalletContextState,
): DialectSolanaWalletAdapter | null {
  if (
    !wallet.connected ||
    wallet.connecting ||
    wallet.disconnecting ||
    !wallet.publicKey
  ) {
    return null;
  }

  return {
    publicKey: wallet.publicKey!,
    signMessage: wallet.signMessage,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    // @ts-ignore
    diffieHellman: wallet.wallet?.adapter?._wallet?.diffieHellman
      ? async (pubKey: any) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return wallet.wallet?.adapter?._wallet?.diffieHellman(pubKey);
        }
      : undefined,
  };
}
