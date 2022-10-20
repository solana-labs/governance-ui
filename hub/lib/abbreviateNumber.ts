import type { BigNumber } from 'bignumber.js';

import { formatNumber } from './formatNumber';

const ABBREVIATIONS = [
  [1000000000, 'B'],
  [1000000, 'M'],
  [1000, 'K'],
] as const;

export function abbreviateNumber(
  number: BigNumber | number | bigint,
  locale?: string,
  options?: Intl.NumberFormatOptions,
) {
  for (const [value, symbol] of ABBREVIATIONS) {
    if (typeof number === 'number') {
      if (number > value) {
        const abbr = (number / value).toFixed(
          options?.maximumFractionDigits || 2,
        );
        return `${abbr}${symbol}`;
      }
    } else if (typeof number === 'bigint') {
      if (number > value) {
        const val = BigInt(value);
        const str = (number / val).toString();
        const abbr = parseFloat(str).toFixed(
          options?.maximumFractionDigits || 2,
        );
        return `${abbr}${symbol}`;
      }
    } else {
      if (number.isGreaterThanOrEqualTo(value)) {
        const abbr = number
          .dividedBy(value)
          .toNumber()
          .toFixed(options?.maximumFractionDigits || 2);
        return `${abbr}${symbol}`;
      }
    }
  }

  return formatNumber(number, locale, options);
}
