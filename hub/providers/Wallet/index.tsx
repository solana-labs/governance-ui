import { WalletContextState, useWallet } from '@solana/wallet-adapter-react';
import type { PublicKey } from '@solana/web3.js';
import React, { createContext } from 'react';

import { useWalletSelector } from '@hub/hooks/useWalletSelector';
import { WalletSelector } from '@hub/providers/WalletSelector';

interface Value {
  connect(): Promise<PublicKey>;
  publicKey?: PublicKey;
  signMessage: NonNullable<WalletContextState['signMessage']>;
  signTransaction: NonNullable<WalletContextState['signTransaction']>;
  signAllTransactions: NonNullable<WalletContextState['signAllTransactions']>;
}

export const DEFAULT: Value = {
  connect: async () => {
    throw new Error('Not implemented');
  },
  publicKey: undefined,
  signMessage: async () => {
    throw new Error('Not implemented');
  },
  signTransaction: async () => {
    throw new Error('Not implemented');
  },
  signAllTransactions: async () => {
    throw new Error('Not implemented');
  },
};

export const context = createContext(DEFAULT);

interface Props {
  children?: React.ReactNode;
}

function WalletProviderInner(props: Props) {
  const { wallet } = useWallet();
  const { getAdapter } = useWalletSelector();

  return (
    <context.Provider
      value={{
        connect: () => getAdapter().then(({ publicKey }) => publicKey),
        publicKey: wallet?.adapter.publicKey || undefined,
        signMessage: async (message) => {
          const { signMessage } = await getAdapter();
          return signMessage(message);
        },
        signTransaction: async (transaction) => {
          const { signTransaction } = await getAdapter();
          return signTransaction(transaction);
        },
        signAllTransactions: async (transactions) => {
          const { signAllTransactions } = await getAdapter();
          return signAllTransactions(transactions);
        },
      }}
    >
      {props.children}
    </context.Provider>
  );
}

export function WalletProvider(props: Props) {
  return (
    <WalletSelector>
      <WalletProviderInner>{props.children}</WalletProviderInner>
    </WalletSelector>
  );
}
