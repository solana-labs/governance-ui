import { useContext } from 'react';

import { context } from '@hub/providers/Wallet';

export function useWallet() {
  const {
    connect,
    publicKey,
    signMessage,
    signTransaction,
    signAllTransactions,
  } = useContext(context);
  return {
    connect,
    publicKey,
    signMessage,
    signTransaction,
    signAllTransactions,
  };
}
