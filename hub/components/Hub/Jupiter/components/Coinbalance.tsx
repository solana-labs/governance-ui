import * as React from 'react';

import { useAccounts } from '../contexts/accounts';

import { formatNumber } from '../misc/utils';

interface ICoinBalanceProps {
  mintAddress: string;
  hideZeroBalance?: boolean;
}

const CoinBalance: React.FunctionComponent<ICoinBalanceProps> = (props) => {
  const { accounts } = useAccounts();
  const balance = React.useMemo(() => {
    return accounts[props.mintAddress]?.balance || 0;
  }, [accounts, props.mintAddress]);

  if (props.hideZeroBalance && balance === 0) return null;

  return <span translate="no">{formatNumber.format(balance)}</span>;
};

export default CoinBalance;
