import { BN, ProgramAccount } from '@coral-xyz/anchor'
import { MintInfo } from '@solana/spl-token'
import { TokenInfoWithoutDecimals } from '@utils/services/tokenPrice'
import { BigNumber } from 'bignumber.js'

const SECONDS_PER_DAY = 86400

export function getDaysFromTimestamp(unixTimestamp: number) {
  return unixTimestamp / SECONDS_PER_DAY
}

export function getHoursFromTimestamp(unixTimestamp: number) {
  return unixTimestamp / (60 * 60)
}

export function getTimestampFromDays(days: number) {
  return days * SECONDS_PER_DAY
}

export function getTimestampFromHours(hours: number) {
  return hours * 60 * 60
}

export function fmtBnMintDecimals(amount: BN, decimals: number) {
  return new BigNumber(amount.toString()).shiftedBy(-decimals).toFormat()
}

export function fmtBnMintDecimalsUndelimited(amount: BN, decimals: number) {
  return new BigNumber(amount.toString())
    .shiftedBy(-decimals)
    .toFormat()
    .replaceAll(',', '')
}

export function fmtBNAmount(amount: BN | number | string) {
  return new BigNumber(amount.toString()).toFormat()
}

/// Formats mint amount (natural units) as a decimal string
export function fmtMintAmount(mint: MintInfo | undefined, mintAmount: BN) {
  return mint
    ? getMintDecimalAmount(mint, mintAmount).toFormat()
    : new BigNumber(mintAmount.toString()).toFormat()
}

export function fmtTokenInfoWithMint(
  amount: BN,
  mintInfo: ProgramAccount<MintInfo>,
  tokenInfo: TokenInfoWithoutDecimals | undefined = undefined
) {
  return `${fmtBnMintDecimals(amount, mintInfo.account.decimals)} ${
    tokenInfo?.symbol
      ? tokenInfo?.symbol
      : `${mintInfo.publicKey.toString().substring(0, 12)}...`
  }`
}

// Converts mint amount (natural units) to decimals
export function getMintDecimalAmount(mint: MintInfo, mintAmount: BN) {
  return new BigNumber(mintAmount.toString()).shiftedBy(-mint.decimals)
}
export function getBigNumberAmount(amount: BN | number) {
  return typeof amount === 'number'
    ? new BigNumber(amount)
    : new BigNumber(amount.toString())
}

// Parses input string in decimals to mint amount (natural units)
// If the input is already a number then converts it to mint natural amount
export function parseMintNaturalAmountFromDecimal(
  decimalAmount: string | number,
  mintDecimals: number
) {
  if (typeof decimalAmount === 'number') {
    return getMintNaturalAmountFromDecimal(decimalAmount, mintDecimals)
  }

  if (mintDecimals === 0) {
    return parseInt(decimalAmount)
  }

  const floatAmount = parseFloat(decimalAmount)
  return getMintNaturalAmountFromDecimal(floatAmount, mintDecimals)
}

export function parseMintNaturalAmountFromDecimalAsBN(
  decimalAmount: string | number,
  mintDecimals: number
) {
  return new BN(
    parseMintNaturalAmountFromDecimal(decimalAmount, mintDecimals).toString()
  )
}

// Converts amount in decimals to mint amount (natural units)
export function getMintNaturalAmountFromDecimal(
  decimalAmount: number,
  decimals: number
) {
  return new BigNumber(decimalAmount).shiftedBy(decimals).toNumber()
}

// Converts amount in decimals to mint amount (natural units)
export function getMintNaturalAmountFromDecimalAsBN(
  decimalAmount: number,
  decimals: number
) {
  return new BN(new BigNumber(decimalAmount).shiftedBy(decimals).toString())
}

// Calculates mint min amount as decimal
export function getMintMinAmountAsDecimal(mint: MintInfo) {
  return new BigNumber(1).shiftedBy(-mint.decimals).toNumber()
}

export function formatMintNaturalAmountAsDecimal(
  mint: MintInfo,
  naturalAmount: BN
) {
  return getMintDecimalAmountFromNatural(mint, naturalAmount).toFormat()
}

export function getMintDecimalAmountFromNatural(
  mint: MintInfo,
  naturalAmount: BN
) {
  return new BigNumber(naturalAmount.toString()).shiftedBy(-mint.decimals)
}

// Returns mint supply amount as decimal
export function getMintSupplyAsDecimal(mint: MintInfo) {
  return new BigNumber(mint.supply.toString())
    .shiftedBy(-mint.decimals)
    .toNumber()
}

// Calculates percentage (provided as 0-100) of mint supply as BigNumber amount
export function getMintSupplyPercentageAsBigNumber(
  mint: MintInfo,
  percentage: number
) {
  return new BigNumber(
    mint.supply.mul(new BN(percentage)).toString()
  ).shiftedBy(-(mint.decimals + 2))
}

// Calculates percentage (provided as 0-100) of mint supply as decimal amount
export function getMintSupplyPercentageAsDecimal(
  mint: MintInfo,
  percentage: number
) {
  return getMintSupplyPercentageAsBigNumber(mint, percentage).toNumber()
}

// Calculates percentage (provided as 0-100) of mint supply as rounded BN amount
export function getMintSupplyPercentageAsBN(
  mint: MintInfo,
  percentage: number
) {
  return new BN(
    getMintSupplyPercentageAsBigNumber(mint, percentage)
      .dp(0, BigNumber.ROUND_DOWN) // BN doesn't support floating point and we have to round it
      .toString()
  )
}

// Formats percentage value showing it in human readable form
export function fmtPercentage(percentage: number) {
  if (percentage === 0 || percentage === Infinity) {
    return '0%'
  }

  if (percentage < 0.01) {
    return '<0.01%'
  }

  if (percentage > 100) {
    return '>100%'
  }

  return `${+percentage.toFixed(2)}%`
}

// Calculates mint supply fraction for the given natural amount as decimal amount
export function getMintSupplyFractionAsDecimalPercentage(
  mint: MintInfo,
  naturalAmount: BN | number
) {
  return getBigNumberAmount(naturalAmount)
    .multipliedBy(100)
    .dividedBy(new BigNumber(mint.supply.toString()))
    .toNumber()
}
