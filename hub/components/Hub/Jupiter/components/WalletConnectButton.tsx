import { useWallet } from '@solana/wallet-adapter-react';
import React from 'react';

import { useWalletSelector } from '@hub/hooks/useWalletSelector';

import JupButton from './JupButton';

const WalletConnectButton = () => {
  const { getAdapter } = useWalletSelector();
  const { wallet, connect, connecting } = useWallet();

  const onClick = () => {
    if (wallet) connect();
    else {
      getAdapter();
    }
  };

  return (
    <JupButton onClick={onClick}>
      {connecting && (
        <span>
          <span>Connecting...</span>
        </span>
      )}
      {!connecting && (
        <span>
          <span>Connect</span>
        </span>
      )}
    </JupButton>
  );
};

export default WalletConnectButton;
