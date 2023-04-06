import {
  MintMaxVoteWeightSource,
  MintMaxVoteWeightSourceType,
} from '@solana/spl-governance'
import BN from 'bn.js'
import { BigNumber } from 'bignumber.js'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import { MintInfo } from '@solana/spl-token'
import {
  fmtMintAmount,
  parseMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'

export const parseMintMaxVoteWeight = (
  useSupplyFactor: boolean,
  communityMintDecimals: number,
  supplyFactor?: number,
  absoluteValue?: number
) => {
  if (useSupplyFactor) {
    return supplyFactor
      ? new MintMaxVoteWeightSource({
          type: MintMaxVoteWeightSourceType.SupplyFraction,
          value: new BN(
            new BigNumber(supplyFactor.toString())
              .shiftedBy(MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS)
              .toString()
          ),
        })
      : MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION
  } else
    return new MintMaxVoteWeightSource({
      type: MintMaxVoteWeightSourceType.Absolute,
      value: absoluteValue
        ? parseMintNaturalAmountFromDecimalAsBN(
            absoluteValue,
            communityMintDecimals
          )
        : new BN(1000),
    })
}

/// Chekcs if the given voter_weight is the disabled weight threshold
export function isDisabledVoterWeight(voter_weight: BN | number | string) {
  const voter_weight_bn =
    voter_weight instanceof BN ? voter_weight : new BN(voter_weight.toString())

  return DISABLED_VOTER_WEIGHT.eq(voter_weight_bn)
}

export function fmtVoterWeightThresholdMintAmount(
  mint: MintInfo | undefined,
  voter_weight: BN | number | string
) {
  const voter_weight_bn =
    voter_weight instanceof BN ? voter_weight : new BN(voter_weight.toString())

  return DISABLED_VOTER_WEIGHT.eq(voter_weight_bn)
    ? 'Disabled'
    : fmtMintAmount(mint, voter_weight_bn)
}
