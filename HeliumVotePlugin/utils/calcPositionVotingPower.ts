import { BN } from '@coral-xyz/anchor'
import { calcMultiplier } from './calcLockupMultiplier'
import { Position, VotingMintConfig, Registrar, LockupKind } from '../sdk/types'

export const calcPositionVotingPower = ({
  position,
  registrar,
}: {
  position: Position | null
  registrar: Registrar | null
}) => {
  let votingPower = new BN(0)
  const mintCfgs = registrar?.votingMints || []
  const mintCfg = position ? mintCfgs[position.votingMintConfigIdx] : undefined

  if (position && mintCfg) {
    const {
      lockupSaturationSecs,
      baselineVoteWeightScaledFactor,
      maxExtraLockupVoteWeightScaledFactor,
      genesisVotePowerMultiplier = 1,
    } = mintCfg as VotingMintConfig
    const now = new BN(Math.round(new Date().getTime() / 1000))
    const hasGenesisMultiplier = position.genesisEnd.gt(now)
    const lockup = position!.lockup
    const lockupKind = Object.keys(lockup.kind as LockupKind)[0]
    const currTs = lockupKind === 'constant' ? lockup.startTs : now
    const lockupSecs = lockup.endTs.sub(currTs).toNumber()
    const amountLockedNative = position!.amountDepositedNative.toNumber()
    const baselineScaledFactorNum = baselineVoteWeightScaledFactor.toNumber()
    const maxExtraLockupVoteWeightScaledFactorNum = maxExtraLockupVoteWeightScaledFactor.toNumber()
    const lockupSaturationSecsNum = lockupSaturationSecs.toNumber()

    const multiplier =
      (hasGenesisMultiplier ? genesisVotePowerMultiplier : 1) *
      calcMultiplier({
        baselineScaledFactor: baselineScaledFactorNum,
        maxExtraLockupScaledFactor: maxExtraLockupVoteWeightScaledFactorNum,
        lockupSecs,
        lockupSaturationSecs: lockupSaturationSecsNum,
      })

    votingPower = new BN(amountLockedNative * multiplier)
  }

  return votingPower
}
