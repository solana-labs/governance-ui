import { MintMaxVoteWeightSource } from '@solana/spl-governance'
import BN from 'bn.js'
import { BigNumber } from 'bignumber.js'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'

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

/// Chekcs if the given voter_weight is the disabled weight threshold
export function isDisabledVoterWeight(voter_weight: BN | number | string) {
  const voter_weight_bn =
    voter_weight instanceof BN ? voter_weight : new BN(voter_weight.toString())

  return DISABLED_VOTER_WEIGHT.eq(voter_weight_bn)
}
