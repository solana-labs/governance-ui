import { BN } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'
import { BigNumber } from 'bignumber.js'

/// Formats mint amount (natural units) as a decimal string
export function fmtMintAmount(mint: MintInfo, mintAmount: BN) {
  return getMintDecimalAmount(mint, mintAmount).toFormat()
}

// Converts mint amount (natural units) to decimals
export function getMintDecimalAmount(mint: MintInfo, mintAmount: BN) {
  return new BigNumber(mintAmount.toString()).shiftedBy(-mint.decimals)
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

// Converts amount in decimals to mint amount (natural units)
export function getMintNaturalAmountFromDecimal(
  decimalAmount: number,
  decimals: number
) {
  return new BigNumber(decimalAmount).shiftedBy(decimals).toNumber()
}
