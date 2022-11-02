import { MintInfo } from '@solana/spl-token'
import BN from 'bn.js'
import { BigNumber } from 'bignumber.js'
import {
  MintMaxVoteWeightSource,
  MintMaxVoteWeightSourceType,
} from '@solana/spl-governance'

export function calculateMintMaxVoteWeight(
  mint: MintInfo,
  maxVoteWeightSource: MintMaxVoteWeightSource
) {
  if (maxVoteWeightSource.isFullSupply()) {
    return mint.supply as BN
  }

  if (maxVoteWeightSource.type === MintMaxVoteWeightSourceType.SupplyFraction) {
    const supplyFraction = maxVoteWeightSource.getSupplyFraction()

    const maxVoteWeight = new BigNumber(supplyFraction.toString())
      .multipliedBy(mint.supply.toString())
      .shiftedBy(-MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS)

    return new BN(maxVoteWeight.dp(0, BigNumber.ROUND_DOWN).toString())
  } else {
    // absolute value
    return maxVoteWeightSource.value
  }
}
