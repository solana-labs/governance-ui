import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { BN, EventParser } from '@project-serum/anchor'
import {
  ProgramAccount,
  Realm,
  simulateTransaction,
} from '@solana/spl-governance'
import { PublicKey, Transaction, Connection } from '@solana/web3.js'
import { tryGetMint } from '@utils/tokens'
import {
  getRegistrarPDA,
  getVoterPDA,
  emptyPk,
  DepositWithMintAccount,
  LockupType,
  Registrar,
} from 'VoteStakeRegistry/sdk/accounts'
import { tryGetVoter, tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'
import { DAYS_PER_MONTH } from './dateTools'
import { MONTHLY } from './types'

export const getDeposits = async ({
  isUsed = true,
  realmPk,
  walletPk,
  communityMintPk,
  client,
  connection,
}: {
  isUsed?: boolean | undefined
  realmPk: PublicKey
  walletPk: PublicKey
  communityMintPk: PublicKey
  client: VsrClient
  connection: Connection
}) => {
  const clientProgramId = client.program.programId
  const { registrar } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    clientProgramId
  )
  const { voter } = await getVoterPDA(registrar, walletPk, clientProgramId)
  const existingVoter = await tryGetVoter(voter, client)
  const existingRegistrar = await tryGetRegistrar(registrar, client)
  const mintCfgs = existingRegistrar?.votingMints || []
  const mints = {}
  let votingPower = new BN(0)
  let votingPowerFromDeposits = new BN(0)
  let deposits: DepositWithMintAccount[] = []
  for (const i of mintCfgs) {
    if (i.mint.toBase58() !== emptyPk) {
      const mint = await tryGetMint(connection, i.mint)
      mints[i.mint.toBase58()] = mint
    }
  }
  if (existingVoter) {
    deposits = existingVoter.deposits
      .map(
        (x, idx) =>
          ({
            ...x,
            mint: mints[mintCfgs![x.votingMintConfigIdx].mint.toBase58()],
            index: idx,
          } as DepositWithMintAccount)
      )
      .filter((x) => typeof isUsed === 'undefined' || x.isUsed === isUsed)
    const usedDeposits = deposits.filter((x) => x.isUsed)
    const areThereAnyUsedDeposits = usedDeposits.length
    if (areThereAnyUsedDeposits) {
      const events = await getDepositsAdditionalInfoEvents(
        client,
        usedDeposits,
        connection,
        registrar,
        voter
      )
      const DEPOSIT_EVENT_NAME = 'DepositEntryInfo'
      const VOTER_INFO_EVENT_NAME = 'VoterInfo'
      const depositsInfo = events.filter((x) => x.name === DEPOSIT_EVENT_NAME)
      const votingPowerEntry = events.find(
        (x) => x.name === VOTER_INFO_EVENT_NAME
      )
      deposits = deposits.map((x) => {
        const additionalInfoData = depositsInfo.find(
          (info) => info.data.depositEntryIndex === x.index
        ).data

        x.currentlyLocked = additionalInfoData.locking?.amount || new BN(0)
        x.available = additionalInfoData.unlocked || new BN(0)
        x.vestingRate = additionalInfoData.locking?.vesting?.rate || new BN(0)
        x.nextVestingTimestamp =
          additionalInfoData.locking?.vesting?.nextTimestamp || null
        x.votingPower = additionalInfoData.votingPower || new BN(0)
        x.votingPowerBaseline =
          additionalInfoData.votingPowerBaseline || new BN(0)
        return x
      })
      if (
        votingPowerEntry &&
        !votingPowerEntry.data.votingPowerBaseline.isZero()
      ) {
        votingPowerFromDeposits = votingPowerEntry.data.votingPowerBaseline
      }
      if (votingPowerEntry && !votingPowerEntry.data.votingPower.isZero()) {
        votingPower = votingPowerEntry.data.votingPower
      }
      return { votingPower, deposits, votingPowerFromDeposits }
    }
  }
  return { votingPower, deposits, votingPowerFromDeposits }
}

export const calcMultiplier = ({
  depositScaledFactor,
  maxExtraLockupVoteWeightScaledFactor,
  lockupSecs,
  lockupSaturationSecs,
}: {
  depositScaledFactor: number
  maxExtraLockupVoteWeightScaledFactor: number
  lockupSecs: number
  lockupSaturationSecs: number
}) => {
  //   if (isVested) {
  //     const onMonthSecs = SECS_PER_DAY * DAYS_PER_MONTH
  //     const n_periods_before_saturation = lockupSaturationSecs / onMonthSecs
  //     const n_periods = lockupSecs / onMonthSecs
  //     const n_unsaturated_periods = Math.min(
  //       n_periods,
  //       n_periods_before_saturation
  //     )
  //     const n_saturated_periods = Math.max(0, n_periods - n_unsaturated_periods)
  //     const calc =
  //       (depositScaledFactor +
  //         (maxExtraLockupVoteWeightScaledFactor / n_periods) *
  //           (n_saturated_periods +
  //             ((n_unsaturated_periods + 1) * n_unsaturated_periods) /
  //               2 /
  //               n_periods_before_saturation)) /
  //       depositScaledFactor
  //     return depositScaledFactor !== 0 ? calc : 0
  //   }
  const calc =
    (depositScaledFactor +
      (maxExtraLockupVoteWeightScaledFactor *
        Math.min(lockupSecs, lockupSaturationSecs)) /
        lockupSaturationSecs) /
    depositScaledFactor
  return depositScaledFactor !== 0 ? calc : 0
}

export const getPeriod = (
  lockUpPeriodInDays: number,
  lockupKind: LockupType
) => {
  //in case we do monthly close up we pass months not days.
  const period =
    lockupKind !== MONTHLY
      ? lockUpPeriodInDays
      : lockUpPeriodInDays / DAYS_PER_MONTH
  //   const maxMonthsNumber = 72
  //   const daysLimit = 2190
  //additional prevention of lockup being to high in case of monthly lockup 72 months as 6 years
  //in case of other types 2190 days as 6 years
  //   if (lockupKind === MONTHLY && period > maxMonthsNumber) {
  //     throw 'lockup period is to hight'
  //   }
  //   if (lockupKind !== MONTHLY && period > daysLimit) {
  //     throw 'lockup period is to hight'
  //   }
  return period
}

export const calcMintMultiplier = (
  lockupSecs: number,
  registrar: Registrar | null,
  realm: ProgramAccount<Realm> | undefined
) => {
  const mintCfgs = registrar?.votingMints
  const mintCfg = mintCfgs?.find(
    (x) => x.mint.toBase58() === realm?.account.communityMint.toBase58()
  )
  if (mintCfg) {
    const {
      lockupSaturationSecs,
      baselineVoteWeightScaledFactor,
      maxExtraLockupVoteWeightScaledFactor,
    } = mintCfg
    const depositScaledFactorNum = baselineVoteWeightScaledFactor.toNumber()
    const maxExtraLockupVoteWeightScaledFactorNum =
      maxExtraLockupVoteWeightScaledFactor.toNumber()
    const lockupSaturationSecsNum = lockupSaturationSecs.toNumber()
    //(deposit_scaled_factor + max_extra_lockup_vote_weight_scaled_factor * min(lockup_secs, lockup_saturation_secs) / lockup_saturation_secs) / deposit_scaled_factor
    const calced = calcMultiplier({
      depositScaledFactor: depositScaledFactorNum,
      maxExtraLockupVoteWeightScaledFactor:
        maxExtraLockupVoteWeightScaledFactorNum,
      lockupSaturationSecs: lockupSaturationSecsNum,
      lockupSecs,
    })

    return parseFloat(calced.toFixed(2))
  }
  return 0
}

const getDepositsAdditionalInfoEvents = async (
  client: VsrClient,
  usedDeposits: DepositWithMintAccount[],
  connection: Connection,
  registrar: PublicKey,
  voter: PublicKey
) => {
  // The wallet can be any existing account for the simulation
  // Note: when running a local validator ensure the account is copied from devnet: --clone ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk -ud
  const walletPk = new PublicKey('ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk')
  //because we switch wallet in here we can't use rpc from npm module
  //anchor dont allow to switch wallets inside existing client
  //parse events response as anchor do
  const events: any[] = []
  const parser = new EventParser(client.program.programId, client.program.coder)
  const maxRange = 8
  const maxIndex = Math.max(...usedDeposits.map((x) => x.index)) + 1
  const numberOfSimulations = Math.ceil(maxIndex / maxRange)
  for (let i = 0; i < numberOfSimulations; i++) {
    const take = maxRange
    const transaction = new Transaction({ feePayer: walletPk })
    const logVoterInfoIx = await client.program.methods
      .logVoterInfo(maxRange * i, take)
      .accounts({ registrar, voter })
      .instruction()
    transaction.add(logVoterInfoIx)
    const batchOfDeposits = await simulateTransaction(
      connection,
      transaction,
      'recent'
    )
    parser.parseLogs(batchOfDeposits.value.logs!, (event) => {
      events.push(event)
    })
  }
  return events
}
