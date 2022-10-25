import { WRAPPED_SOL_MINT } from '@project-serum/serum/lib/token-instructions';
import { TokenInfo } from '@solana/spl-token-registry';
import React, { CSSProperties } from 'react';

import CoinBalance from './Coinbalance';
import { PAIR_ROW_HEIGHT } from './FormPairSelector';
import TokenIcon from './TokenIcon';

const FormPairRow: React.FC<{
  item: TokenInfo;
  style: CSSProperties;
  onSubmit(item: TokenInfo): void;
}> = ({ item, style, onSubmit }) => {
  return (
    <li
      className={`rounded py-4 cursor-pointer px-5 list-none hover:bg-black/10`}
      style={{ maxHeight: PAIR_ROW_HEIGHT, height: PAIR_ROW_HEIGHT, ...style }}
      onClick={() => onSubmit(item)}
      translate="no"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-6 w-6 bg-gray-200 rounded-full">
            <TokenIcon tokenInfo={item} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white-75 truncate">
            {item.symbol}
          </p>
          <p className="text-xs text-gray-500 dark:text-white/35 truncate">
            {item.address === WRAPPED_SOL_MINT.toBase58()
              ? 'Solana'
              : item.name}
          </p>
        </div>

        <div className="text-xs dark:text-white-35 text-right">
          <CoinBalance mintAddress={item.address} hideZeroBalance />
        </div>
      </div>
    </li>
  );
};

export default FormPairRow;
