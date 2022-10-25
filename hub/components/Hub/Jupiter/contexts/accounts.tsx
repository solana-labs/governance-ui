import useLocalStorageState from '@hooks/useLocalStorageState';
import { BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getConnectionContext } from '@utils/connection';
import tokenService from '@utils/services/token';
import React, { useContext, useEffect, useState } from 'react';

export interface IAccountsBalance {
  balance: number;
  balanceLamports: BN;
  hasBalance: boolean;
  decimals: number;
}

interface IAccountContext {
  accounts: Record<string, IAccountsBalance>;
  tokenServiceReady: boolean;
}

interface ParsedTokenData {
  account: {
    data: {
      parsed: {
        info: {
          isNative: boolean;
          mint: string;
          owner: string;
          state: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
            uiAmountString: string;
          };
        };
        type: string;
      };
      program: string;
      space: number;
    };
    executable: boolean;
    lamports: number;
    owner: PublicKey;
    rentEpoch?: number;
  };
  pubkey: PublicKey;
}

const AccountContext = React.createContext<IAccountContext>({
  accounts: {},
  tokenServiceReady: false,
});

const AccountsProvider: React.FC = ({ children }) => {
  const { publicKey } = useWallet();
  const [currentCluster] = useLocalStorageState('cluster', 'mainnet');
  const { current: connection } = getConnectionContext(currentCluster);

  const [accounts, setAccounts] = useState<Record<string, IAccountsBalance>>(
    {},
  );
  const [tokenServiceReady, setTokenServiceReady] = useState(false);

  // Fetch all accounts for the current wallet
  useEffect(() => {
    if (!publicKey) return;

    connection
      .getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID },
        'confirmed',
      )
      .then(({ value: result }) => {
        const reducedResult = result.reduce((acc, item: ParsedTokenData) => {
          acc[item.account.data.parsed.info.mint] = {
            balance: item.account.data.parsed.info.tokenAmount.uiAmount,
            balanceLamports: new BN(0),
            hasBalance: item.account.data.parsed.info.tokenAmount.uiAmount > 0,
            decimals: item.account.data.parsed.info.tokenAmount.decimals,
          };
          return acc;
        }, {} as Record<string, IAccountsBalance>);

        setAccounts(reducedResult);
      });
  }, [publicKey]);

  // Fetch Token service
  useEffect(() => {
    tokenService
      .fetchSolanaTokenList()
      .then(() => setTokenServiceReady(true))
      .catch(() => setTokenServiceReady(false));
  }, []);

  return (
    <AccountContext.Provider value={{ accounts, tokenServiceReady }}>
      {children}
    </AccountContext.Provider>
  );
};

const useAccounts = () => {
  return useContext(AccountContext);
};

export { AccountsProvider, useAccounts };
