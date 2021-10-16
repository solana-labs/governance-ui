import { BN } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'
import { BigNumber } from 'bignumber.js'

/// Formats mint amount (natural units) as a decimal string
export function fmtMintAmount(mint: MintInfo | undefined, mintAmount: BN) {
  return mint
    ? getMintDecimalAmount(mint, mintAmount).toFormat()
    : new BigNumber(mintAmount.toString()).toFormat()
}

// Converts mint amount (natural units) to decimals
export function getMintDecimalAmount(mint: MintInfo, mintAmount: BN) {
  return new BigNumber(mintAmount.toString()).shiftedBy(-mint.decimals)
}
