import { BN, EventParser, Idl, Program } from '@coral-xyz/anchor'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import { PublicKey, Transaction, Connection } from '@solana/web3.js'
import { SIMULATION_WALLET } from '@tools/constants'
import { DAYS_PER_MONTH } from '@utils/dateTools'
import { chunks } from '@utils/helpers'
import { tryGetMint } from '@utils/tokens'
import {
  getRegistrarPDA,
  getVoterPDA,
  emptyPk,
  DepositWithMintAccount,
  LockupType,
  Registrar,
  Voter,
  Deposit,
} from 'VoteStakeRegistry/sdk/accounts'
import { tryGetVoter, tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import { MONTHLY } from './types'
import { fetchVotingPowerSimulation } from '@hooks/queries/plugins/vsr'

const VOTER_INFO_EVENT_NAME = 'VoterInfo'
const DEPOSIT_EVENT_NAME = 'DepositEntryInfo'
// The wallet can be any existing account for the simulation
// Note: when running a local validator ensure the account is copied from devnet: --clone ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk -ud
const simulationWallet = new PublicKey(SIMULATION_WALLET)

const logsToEvents = <T extends Idl>(
  program: Program<T>,
  logs: string[],
  walletPk: string
): {
  walletPk: string
  event: any
}[] => {
  const parser = new EventParser(program.programId, program.coder)
  const errors = parser.parseLogs(logs)
  return [...errors].map((event) => ({ event, walletPk }))
}

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
      const depositsInfo = events.filter((x) => x.name === DEPOSIT_EVENT_NAME)
      const votingPowerEntry = events.find(
        (x) => x.name === VOTER_INFO_EVENT_NAME
      ) as any
      deposits = deposits.map((x) => {
        const additionalInfoData = depositsInfo.find(
          (info) => info.data.depositEntryIndex === x.index
        )?.data as any

        x.currentlyLocked = additionalInfoData?.locking.amount || new BN(0)
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

      return { deposits, votingPowerFromDeposits }
    }
  }
  return { deposits, votingPowerFromDeposits }
}

const getVotingPowersForWallets = async ({
  client,
  registrarPk,
  existingRegistrar,
  walletPks,
  connection,
  latestBlockhash,
}: {
  client: VsrClient
  connection: Connection
  registrarPk: PublicKey
  existingRegistrar: Registrar
  walletPks: PublicKey[]
  latestBlockhash: Readonly<{
    blockhash: string
    lastValidBlockHeight: number
  }>
}) => {
  const clientProgramId = client.program.programId
  const voterPks: PublicKey[] = []
  const voters: (Voter | null)[] = []
  const encodedTransactionsParsedByWallets: {
    walletPk: string
    tx: string
  }[] = []
  const mintCfgs = existingRegistrar.votingMints
  const events: {
    walletPk: string
    event: any
  }[] = []
  for (const walletPk of walletPks) {
    const { voter } = await getVoterPDA(registrarPk, walletPk, clientProgramId)
    voterPks.push(voter)
  }

  const voterAccsResponse = await client?.program.account.voter.fetchMultiple(
    voterPks
  )
  voters.push(...(voterAccsResponse as (Voter | null)[]))

  if (voters.length) {
    for (const i in voters) {
      const voter = voters[i]
      const voterPk = voterPks[i]
      if (voter) {
        const hasDepositsWithCommunityMint = voter.deposits.find(
          (x) =>
            x.isUsed &&
            mintCfgs[x.votingMintConfigIdx].baselineVoteWeightScaledFactor.gtn(
              0
            )
        )
        if (hasDepositsWithCommunityMint) {
          const simulationWallet = new PublicKey(SIMULATION_WALLET)

          const originalTx = new Transaction({ feePayer: simulationWallet })
          const logVoterInfoIx = await client.program.methods
            .logVoterInfo(1, 1)
            .accounts({ registrar: registrarPk, voter: voterPk })
            .instruction()
          originalTx.add(logVoterInfoIx)

          const transaction = originalTx
          transaction.lastValidBlockHeight =
            latestBlockhash.lastValidBlockHeight
          transaction.recentBlockhash = latestBlockhash.blockhash
          //@ts-ignore
          const message = transaction._compile()
          const signData = message.serialize()
          //@ts-ignore
          const wireTransaction = transaction._serialize(signData)
          const encodedTransaction = wireTransaction.toString('base64')
          encodedTransactionsParsedByWallets.push({
            walletPk: voter.voterAuthority.toBase58(),
            tx: encodedTransaction,
          })
        }
      }
    }

    const chunkedEncodedTransactionsParsed = chunks(
      encodedTransactionsParsedByWallets,
      100
    )
    const simulations = await Promise.all(
      chunkedEncodedTransactionsParsed.map((txChunk) =>
        fetch(connection.rpcEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            ...txChunk.map((encodedTransaction) => ({
              jsonrpc: '2.0',
              id: encodedTransaction.walletPk,
              method: 'simulateTransaction',
              params: [
                encodedTransaction.tx,
                {
                  commitment: 'recent',
                  encoding: 'base64',
                },
              ],
            })),
          ]),
        })
      )
    )
    const logsJsons = await Promise.all(simulations.map((x) => x.json()))
    for (const logJson of logsJsons) {
      for (const result of logJson) {
        events.push(
          ...logsToEvents(client.program, result.result.value.logs!, result.id)
        )
      }
    }

    const votingPowersPerWallet = events
      .filter((x) => x.event.name === VOTER_INFO_EVENT_NAME)
      .map((x) => ({
        walletPk: x.walletPk,
        votingPower: (x.event?.data?.votingPower as BN) || new BN(0),
      }))
    return votingPowersPerWallet
  }
  return null
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
    const maxExtraLockupVoteWeightScaledFactorNum = maxExtraLockupVoteWeightScaledFactor.toNumber()
    const lockupSaturationSecsNum = lockupSaturationSecs.toNumber()
    //(deposit_scaled_factor + max_extra_lockup_vote_weight_scaled_factor * min(lockup_secs, lockup_saturation_secs) / lockup_saturation_secs) / deposit_scaled_factor
    const calced = calcMultiplier({
      depositScaledFactor: depositScaledFactorNum,
      maxExtraLockupVoteWeightScaledFactor: maxExtraLockupVoteWeightScaledFactorNum,
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
  //because we switch wallet in here we can't use rpc from npm module
  //anchor dont allow to switch wallets inside existing client
  //parse events response as anchor do
  const events: Awaited<ReturnType<typeof fetchVotingPowerSimulation>> = []
  const maxRange = 8
  const maxIndex = Math.max(...usedDeposits.map((x) => x.index)) + 1
  const numberOfSimulations = Math.ceil(maxIndex / maxRange)
  for (let i = 0; i < numberOfSimulations; i++) {
    const logs = await fetchVotingPowerSimulation(
      connection,
      client.program,
      registrar,
      voter,
      maxRange * i,
      maxRange
    )

    events.push(...logs)
  }
  return events
}

export const getLockTokensVotingPowerPerWallet = async (
  walletsPks: PublicKey[],
  realm: ProgramAccount<Realm>,
  client: VsrClient,
  connection: Connection
) => {
  const { registrar } = await getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    client.program.programId
  )
  const existingRegistrar = await tryGetRegistrar(registrar, client)
  const latestBlockhash = await connection.getLatestBlockhash()
  const votingPowers = await getVotingPowersForWallets({
    client: client,
    registrarPk: registrar,
    existingRegistrar: existingRegistrar!,
    walletPks: walletsPks,
    connection: connection,
    latestBlockhash,
  })

  if (votingPowers) {
    const votingPowerObj: Record<string, BN> = {}
    for (const record of votingPowers) {
      votingPowerObj[record.walletPk] = record.votingPower
    }

    return votingPowerObj
  }
  return {}
}

export const getDepositType = (deposit: Deposit): LockupType => {
  if (typeof deposit.lockup.kind.monthly !== 'undefined') {
    return 'monthly'
  } else if (typeof deposit.lockup.kind.cliff !== 'undefined') {
    return 'cliff'
  } else if (typeof deposit.lockup.kind.constant !== 'undefined') {
    return 'constant'
  } else if (typeof deposit.lockup.kind.daily !== 'undefined') {
    return 'daily'
  } else if (typeof deposit.lockup.kind.none !== 'undefined') {
    return 'none'
  }
  return 'none'
}
