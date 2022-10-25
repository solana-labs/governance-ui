import useLocalStorageState from '@hooks/useLocalStorageState';
import { BN } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { AccountInfo } from '@solana/web3.js';
import { getConnectionContext } from '@utils/connection';
import { useEffect, useState } from 'react';

import { IAccountsBalance } from '../contexts/accounts';

import { fromLamports } from '../misc/utils';

const useNativeAccount = (): IAccountsBalance => {
  const { publicKey } = useWallet();
  const [currentCluster] = useLocalStorageState('cluster', 'mainnet');
  const { current: connection } = getConnectionContext(currentCluster);
  const [nativeAccount, setNativeAccount] = useState<AccountInfo<Buffer>>();

  useEffect(() => {
    if (!publicKey) {
      setNativeAccount(undefined);
      return;
    }

    connection.getAccountInfo(publicKey).then((acc) => {
      if (acc) {
        setNativeAccount(acc);
      }
    });
  }, [publicKey]);

  return {
    balance: fromLamports(nativeAccount?.lamports, 9),
    balanceLamports: new BN(nativeAccount?.lamports || 0),
    hasBalance: nativeAccount?.lamports ? nativeAccount?.lamports > 0 : false,
    decimals: 9,
  };
};

export default useNativeAccount;
