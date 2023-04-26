import { PublicKey } from '@solana/web3.js'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import { Registrar, VotingMintConfig } from '../sdk/types'

export const calcMultiplier = ({
  baselineScaledFactor,
  maxExtraLockupScaledFactor,
  lockupSecs,
  lockupSaturationSecs,
}: {
  baselineScaledFactor: number
  maxExtraLockupScaledFactor: number
  lockupSecs: number
  lockupSaturationSecs: number
}): number => {
  let multiplier = 0
  const base = baselineScaledFactor !== 0 ? baselineScaledFactor : 1e9

  multiplier =
    (base +
      (maxExtraLockupScaledFactor *
        Math.min(lockupSecs, lockupSaturationSecs)) /
        lockupSaturationSecs) /
    base

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
  const mintCfgs = registrar?.votingMints || []
  const mintCfg = mintCfgs?.find((cfg) =>
    cfg.mint.equals(realm?.account.communityMint || PublicKey.default)
  )

  if (mintCfg && !mintCfg.mint.equals(PublicKey.default)) {
    const {
      baselineVoteWeightScaledFactor,
      lockupSaturationSecs,
      maxExtraLockupVoteWeightScaledFactor,
      // genesisVotePowerMultiplier,
      // genesisVotePowerMultiplierExpirationTs
    } = mintCfg as VotingMintConfig
    const baselineScaledFactorNum = baselineVoteWeightScaledFactor.toNumber()
    const maxExtraLockupVoteWeightScaledFactorNum = maxExtraLockupVoteWeightScaledFactor.toNumber()
    const lockupSaturationSecsNum = lockupSaturationSecs.toNumber()

    multiplier = calcMultiplier({
      baselineScaledFactor: baselineScaledFactorNum,
      maxExtraLockupScaledFactor: maxExtraLockupVoteWeightScaledFactorNum,
      lockupSecs,
      lockupSaturationSecs: lockupSaturationSecsNum,
    })
  }

  return parseFloat(multiplier.toFixed(2))
}
