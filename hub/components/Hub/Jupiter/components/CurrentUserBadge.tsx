import { useWallet } from '@solana/wallet-adapter-react';
import React from 'react';

import useNativeAccount from '../hooks/useNativeAccount';

import { shortenAddress } from '../misc/utils';

export const CurrentUserBadge: React.FC = () => {
  const { publicKey, wallet } = useWallet();
  const { balance: solBalance } = useNativeAccount();

  if (!wallet || !publicKey) {
    return null;
  }

  return (
    <div className="flex items-center">
      <div
        className="w-8 h-8 rounded-full bg-[#EBEFF1] dark:bg-white-10 flex justify-center items-center"
        style={{ position: 'relative' }}
      >
        <img
          alt="Wallet logo"
          width={20}
          height={20}
          src={wallet?.adapter?.icon}
        />
      </div>

      <div className="ml-2">
        <div
          className="text-sm font-semibold text-black dark:text-white"
          translate="no"
        >{`${solBalance.toFixed(2)} SOL`}</div>
        <div className="text-xs text-black-50 dark:text-white">
          {shortenAddress(`${publicKey}`)}
        </div>
      </div>
    </div>
  );
};
