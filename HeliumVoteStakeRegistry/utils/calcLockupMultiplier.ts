import { PublicKey } from '@solana/web3.js'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import { Registrar } from './types'
import { daysToSecs, secsToDays } from 'VoteStakeRegistry/tools/dateTools'

export const calcMultiplier = ({
  lockedScaledFactor,
  maxExtraLockupScaledFactor,
  lockupSecs,
  minimumRequiredLockupSecs,
  lockupSaturationSecs,
}: {
  lockedScaledFactor: number
  maxExtraLockupScaledFactor: number
  lockupSecs: number
  minimumRequiredLockupSecs: number
  lockupSaturationSecs: number
}): number => {
  let multiplier = 0

  if (lockupSecs > minimumRequiredLockupSecs) {
    multiplier =
      (Math.min(
        (lockupSecs - minimumRequiredLockupSecs) /
          (lockupSaturationSecs - minimumRequiredLockupSecs),
        1
      ) *
        maxExtraLockupScaledFactor) /
      lockedScaledFactor
  } else {
    multiplier =
      (Math.min(lockupSecs / minimumRequiredLockupSecs, 1) *
        lockedScaledFactor) /
      lockedScaledFactor
  }

  return multiplier
}

export const calcLockupMultiplier = ({
  lockupSecs,
  registrar,
  realm,
}: {
  lockupSecs: number
  registrar: Registrar | null
  realm: ProgramAccount<Realm> | undefined
}) => {
  let multiplier = 0
  const mintCfgs = registrar?.votingMints
  const mintCfg = mintCfgs?.find((cfg) =>
    cfg.mint.equals(realm?.account.communityMint || PublicKey.default)
  )

  if (mintCfg && !mintCfg.mint.equals(PublicKey.default)) {
    const {
      lockupSaturationSecs,
      minimumRequiredLockupSecs,
      lockedVoteWeightScaledFactor,
      maxExtraLockupVoteWeightScaledFactor,
      // genesisVotePowerMultiplier,
    } = mintCfg
    const lockedScaledFactorNum = lockedVoteWeightScaledFactor.toNumber()
    const maxExtraLockupVoteWeightScaledFactorNum = maxExtraLockupVoteWeightScaledFactor.toNumber()
    const minimumRequiredLockupSecsNum = minimumRequiredLockupSecs.toNumber()
    const lockupSaturationSecsNum = lockupSaturationSecs.toNumber()

    multiplier = calcMultiplier({
      lockedScaledFactor: lockedScaledFactorNum,
      maxExtraLockupScaledFactor: maxExtraLockupVoteWeightScaledFactorNum,
      lockupSecs,
      minimumRequiredLockupSecs: minimumRequiredLockupSecsNum,
      lockupSaturationSecs: lockupSaturationSecsNum,
    })
  }

  return parseFloat(multiplier.toFixed(2))
}
