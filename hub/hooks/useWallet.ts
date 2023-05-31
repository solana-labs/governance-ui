import { useContext } from 'react';

import { context } from '@hub/providers/Wallet';

export function useWallet() {
  const {
    connect,
    publicKey,
    softConnect,
    setSoftConnect,
    signMessage,
    signTransaction,
    signAllTransactions,
  } = useContext(context);
  return {
    connect,
    publicKey,
    softConnect,
    setSoftConnect,
    signMessage,
    signTransaction,
    signAllTransactions,
  };
}
