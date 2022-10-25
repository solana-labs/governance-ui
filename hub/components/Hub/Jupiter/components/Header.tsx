import { useWallet } from '@solana/wallet-adapter-react';
import React, { useMemo } from 'react';

import JupiterLogo from '../icons/JupiterLogo';

import { CurrentUserBadge } from './CurrentUserBadge';
import WalletConnectButton from './WalletConnectButton';

const Header = () => {
  const { wallet } = useWallet();

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);

  return (
    <div className="w-full flex items-center justify-between h-16 px-6 py-4">
      <div className="flex space-x-2">
        <JupiterLogo />
        <span className="font-bold">Jupiter</span>
      </div>

      <div>
        {!walletPublicKey ? <WalletConnectButton /> : <CurrentUserBadge />}
      </div>
    </div>
  );
};

export default Header;
