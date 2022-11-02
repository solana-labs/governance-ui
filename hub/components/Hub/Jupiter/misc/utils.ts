import BigNumber from 'bignumber.js';
import JSBI from 'jsbi';

const userLocale =
  typeof window !== 'undefined'
    ? navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language
    : 'en-US';

export const numberFormatter = new Intl.NumberFormat(userLocale, {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 9,
});

export const formatNumber = {
  format: (val?: number, precision?: number) => {
    if (!val && val !== 0) {
      return '--';
    }

    return numberFormatter.format(
      precision !== undefined ? +val.toFixed(precision) : val,
    );
  },
};

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function fromLamports(
  lamportsAmount: number | string | JSBI,
  decimals: number,
): number {
  return new BigNumber(lamportsAmount.toString())
    .shiftedBy(-decimals)
    .toNumber();
}

export function toLamports(
  amount: number | string,
  decimals: number,
): BigNumber {
  return new BigNumber(
    new BigNumber(amount.toString()).shiftedBy(decimals).toFixed(0),
  );
}
