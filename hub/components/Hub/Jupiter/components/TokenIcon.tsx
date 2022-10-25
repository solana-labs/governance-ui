import { TokenInfo } from '@solana/spl-token-registry';
import React from 'react';

const TokenIcon: React.FC<{ tokenInfo?: TokenInfo | null }> = ({
  tokenInfo,
}) => {
  return (
    <div className="w-6 h-6 text-xs flex items-center justify-center rounded-full">
      {tokenInfo ? (
        <img
          src={tokenInfo?.logoURI}
          alt={tokenInfo?.symbol}
          width={36}
          height={36}
        />
      ) : (
        <div className="w-6 h-6 items-center justify-center rounded-full bg-gray-200" />
      )}
    </div>
  );
};

export default TokenIcon;
