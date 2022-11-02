import { TokenInfo } from '@solana/spl-token-registry';
import BigNumber from 'bignumber.js';
import classnames from 'classnames';
import JSBI from 'jsbi';
import * as React from 'react';

import { fromLamports, formatNumber } from '../misc/utils';

export interface IRateParams {
  inAmount: JSBI;
  inputDecimal: number;
  outAmount: JSBI;
  outputDecimal: number;
}

export const calculateRate = (
  { inAmount, inputDecimal, outAmount, outputDecimal }: IRateParams,
  reverse: boolean,
): number => {
  const input = fromLamports(inAmount, inputDecimal);
  const output = fromLamports(outAmount, outputDecimal);

  const rate = !reverse
    ? new BigNumber(input).div(output)
    : new BigNumber(output).div(input);

  if (Number.isNaN(rate.toNumber())) {
    return 0;
  }

  return Number(rate.toFixed(reverse ? outputDecimal : inputDecimal));
};

const ApproxSVG = ({
  width = 16,
  height = 16,
}: {
  width?: string | number;
  height?: string | number;
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.8573 8.18429L13.6323 5.95933L10.8573 3.73438V5.31937H3.32735V6.59937H10.8573V8.18429ZM5.14223 7.81429L2.36719 10.0393L5.14223 12.2642V10.6792H12.6722V9.39922H5.14223V7.81429Z"
        fill="#777777"
      />
    </svg>
  );
};

interface ExchangeRateProps {
  className?: string;
  textClassName?: string;
  loading?: boolean;
  inputPair: TokenInfo;
  rateParams: IRateParams;
  outputPair: TokenInfo;
  reversible?: boolean;
}

const ExchangeRate = ({
  className,
  textClassName,
  loading = false,
  inputPair,
  rateParams,
  outputPair,
  reversible = true,
}: ExchangeRateProps) => {
  const [reverse, setReverse] = React.useState(reversible ?? true);

  const rateText = React.useMemo(
    () =>
      loading ? '-' : formatNumber.format(calculateRate(rateParams, reverse)),
    [loading, reverse, rateParams],
  );

  const onReverse: React.MouseEventHandler = React.useCallback((event) => {
    event.stopPropagation();
    setReverse((prevState) => !prevState);
  }, []);

  return (
    <div
      className={classnames(
        className,
        'flex cursor-pointer text-black-50 dark:text-white-50 text-xs align-center',
      )}
      onClick={onReverse}
    >
      <span
        className={classnames(textClassName, 'max-w-full whitespace-nowrap')}
      >
        {reverse ? (
          <>
            1 {inputPair.symbol} ≈ {rateText} {outputPair.symbol}
          </>
        ) : (
          <>
            1 {outputPair.symbol} ≈ {rateText} {inputPair.symbol}
          </>
        )}
      </span>
      {reversible ? (
        <div className={'ml-2'}>
          <ApproxSVG />
        </div>
      ) : null}
    </div>
  );
};

export default ExchangeRate;
