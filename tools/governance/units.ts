import { MintMaxVoteWeightSource } from '@solana/spl-governance'
import BN from 'bn.js'
import { BigNumber } from 'bignumber.js'

export const parseMintMaxVoteWeight = (mintMaxVoteWeight) => {
  let value = MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION.value
  if (mintMaxVoteWeight) {
    const fraction = new BigNumber(mintMaxVoteWeight)
      .shiftedBy(MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS)
      .toString()
    value = new BN(fraction)
  }

  return new MintMaxVoteWeightSource({
    value,
  })
}
