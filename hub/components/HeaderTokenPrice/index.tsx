// @ts-ignore
import CautionIcon from '@carbon/icons-react/lib/Caution';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import { useEffect, useState } from 'react';

import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

interface TokenPrice {
  direction: 'up' | 'down';
  percentChange: number;
  price: number;
}

function useTokenPrice(symbol: string, mint: PublicKey) {
  const [result, setResult] = useState<RE.Result<TokenPrice>>(RE.pending());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setResult(RE.pending());

      setTimeout(() => {
        setResult(
          RE.ok({
            direction: 'up',
            percentChange: 59.8,
            price: 0.345132,
          }),
        );
      }, 1000);
    }
  }, [symbol]);

  return result;
}

interface Props {
  className?: string;
  mint: PublicKey;
  symbol: string;
}

export function HeaderTokenPrice(props: Props) {
  const tokenPrice = useTokenPrice(props.symbol, props.mint);

  return pipe(
    tokenPrice,
    RE.match(
      () => (
        <div className={props.className}>
          <div className="flex items-center">
            <div className="text-xs rounded bg-neutral-200 w-16">&nbsp;</div>
            <div className="text-xs rounded bg-neutral-200 w-16 ml-1">
              &nbsp;
            </div>
          </div>
          <div className="text-base mt-1 rounded bg-neutral-200 w-28">
            &nbsp;
          </div>
        </div>
      ),
      () => (
        <div className={props.className}>
          <div className="flex items-center">
            <div className="text-xs rounded bg-neutral-200 w-16 animate-pulse">
              &nbsp;
            </div>
            <div className="text-xs rounded bg-neutral-200 w-16 ml-1 animate-pulse">
              &nbsp;
            </div>
          </div>
          <div className="text-base mt-1 rounded bg-neutral-200 w-28 animate-pulse">
            &nbsp;
          </div>
        </div>
      ),
      ({ direction, price, percentChange }) => (
        <div className={props.className}>
          <div className="flex items-center">
            <div className="text-xs text-neutral-600">
              #{props.symbol} Price
            </div>
            <CautionIcon
              className={cx(
                'h-2',
                'mx-[1px]',
                'w-2',
                direction === 'up' && 'fill-emerald-500',
                direction === 'down' && 'fill-rose-500',
                direction === 'down' && 'rotate-180',
              )}
            />
            <div
              className={cx(
                'text-xs',
                direction === 'up' && 'text-emerald-500',
                direction === 'down' && 'text-rose-500',
              )}
            >
              {percentChange}%
            </div>
          </div>
          <div className="text-lg text-neutral-900">${price}</div>
        </div>
      ),
    ),
  );
}
