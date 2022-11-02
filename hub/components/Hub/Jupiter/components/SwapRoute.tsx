import { RouteInfo } from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import tokenService from '@utils/services/token';
import classNames from 'classnames';
import React, { useMemo } from 'react';

import { useAccounts } from '../contexts/accounts';
import { formatNumber } from '../misc/utils';

const TowardSVG = () => {
  const fill = 'rgba(0, 0, 0, 0.5)';

  return (
    <svg
      width="10"
      height="5"
      viewBox="0 0 10 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.112 3.328V2.38H6.016V0.892L9.388 2.848L6.016 4.816V3.328H0.112Z"
        fill={fill}
      />
    </svg>
  );
};

const MARKET_LABEL_MAP: { [key: string]: string } = {
  'Orca (Whirlpools)': 'Orca',
};
export const getMarketName = (markets: RouteInfo['marketInfos']) => {
  const names: string[] = [];
  markets.forEach((market) => {
    let label = '';

    const found = Object.keys(MARKET_LABEL_MAP).find(
      (key) => market.amm.label.indexOf(key) >= 0,
    );
    if (found) {
      label = market.amm.label.replaceAll(found, MARKET_LABEL_MAP[found]);
    } else {
      label = market.amm.label;
    }
    names.push(label);
  });

  return names.join(' x ');
};

const SwapRoute: React.FC<{
  route: RouteInfo;
  toValue: string;
  toTokenInfo: TokenInfo;
}> = ({ route, toValue, toTokenInfo }) => {
  const { tokenServiceReady } = useAccounts();

  const { name, path, amount } = useMemo(() => {
    return {
      name: getMarketName(route.marketInfos),
      path: [
        tokenService.getTokenInfo(route.marketInfos[0].inputMint.toBase58())
          ?.symbol || '',
        ...(route.marketInfos
          .map(
            (info) =>
              tokenService.getTokenInfo(info.outputMint.toBase58())?.symbol,
          )
          .filter(Boolean) as string[]),
      ],
      amount: Number(toValue),
    };
  }, [route, toValue, tokenServiceReady]);

  const amountToRender = formatNumber.format(amount, toTokenInfo.decimals);

  const mobileTextSize = (() => {
    const length = amountToRender.length;
    if (length >= 12) return 'text-xs';
    return 'text-md';
  })();

  return (
    <div
      style={{
        height: 'unset',
        backgroundImage:
          'linear-gradient(96.8deg, rgba(250, 164, 58, 1) 4.71%, rgba(113, 229, 237, 1) 87.84%)',
      }}
      className={`cursor-pointer relative w-full rounded-lg p-0.5 mb-2 leading-tight`}
      translate="no"
    >
      <div
        className={classNames({
          'flex items-center justify-between p-4 rounded-lg dark:text-white dark:border-transparent text-[13px] bg-white/80 dark:bg-[rgba(62,62,69,0.9)]': true,
        })}
      >
        <div className={'w-auto'}>
          <div className={classNames('flex items-center font-semibold')}>
            <span>{name}</span>
          </div>

          <div className="flex space-x-1">
            {path.map((item, idx) => (
              <div
                className="flex space-x-1 text-black-50 dark:text-white-50"
                key={idx}
              >
                <div className="font-semibold text-[11px]">
                  <span>{item}</span>
                </div>

                {idx < path.length - 1 && (
                  <div className="flex items-center">
                    <TowardSVG />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-right">
          <div
            className={classNames(
              'font-semibold dark:text-white lg:text-md',
              mobileTextSize,
            )}
          >
            {amountToRender}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapRoute;
