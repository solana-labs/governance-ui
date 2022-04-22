import { Config, MangoClient } from '@blockworks-foundation/mango-client'
import Input from '@components/inputs/Input'
import { GrantInstruction } from '@components/instructions/programs/voteStakeRegistry'
import { MANGO_DAO_TREASURY } from '@components/instructions/tools'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { SearchIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { BN } from '@project-serum/anchor'
import {
  GovernanceAccountType,
  InstructionExecutionStatus,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { getMintDecimalAmount } from '@tools/sdk/units'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import { MANGO_MINT } from 'Strategies/protocols/mango/tools'
import {
  DAYS_PER_MONTH,
  SECS_PER_MONTH,
} from 'VoteStakeRegistry/tools/dateTools'
import InfoBox from './InfoBox'
import LockTokenRow from './LockTokenRow'
import {
  DepoistWithVoter,
  DepositWithWallet,
  getProposalsTransactions,
} from './tools'
import PaginationComponent from '@components/Pagination'
const VestingVsTime = dynamic(() => import('./VestingVsTime'), {
  ssr: false,
})
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

const LockTokenStats = () => {
  const walletsPerPage = 10
  const pagination = useRef<{ setPage: (val) => void }>(null)
  const { realmInfo, realm, mint, proposals } = useRealm()
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const voteStakeRegistryRegistrarPk = useVotePluginsClientStore(
    (s) => s.state.voteStakeRegistryRegistrarPk
  )
  const voteStakeRegistryRegistrar = useVotePluginsClientStore(
    (s) => s.state.voteStakeRegistryRegistrar
  )
  const connection = useWalletStore((s) => s.connection)
  const governedTokenAccounts = useGovernanceAssetsStore(
    (s) => s.governedTokenAccounts
  )
  const [search, setSearch] = useState('')
  const [voters, setVoters] = useState<
    {
      publicKey: PublicKey
      account: any
    }[]
  >([])
  const [depositsWithWallets, setDepositsWithWallets] = useState<
    DepositWithWallet[]
  >([])
  const [givenGrantsTokenAmounts, setGivenGrantsTokenAmounts] = useState<
    DepoistWithVoter[]
  >([])
  const [unlockedFromGrants, setUnlockedFromGrants] = useState(new BN(0))
  const [
    liquidityMiningEmissionPerMonth,
    setLiqudiityMiningEmissionPerMonth,
  ] = useState(new BN(0))
  const [vestPerMonthStats, setVestPerMonthStats] = useState<{
    [key: string]: { vestingDate: dayjs.Dayjs; vestingAmount: BN }[]
  }>({})
  const [statsMonths, setStatsMonths] = useState<string[]>([])
  const [paginatedWallets, setPaginatedWallets] = useState<DepositWithWallet[]>(
    []
  )
  const filteredDepositWithWallets = depositsWithWallets.filter((x) =>
    search ? x.wallet.toBase58().includes(search) : x
  )
  const givenGrantsTokenAmount = givenGrantsTokenAmounts.reduce(
    (acc, curr) => acc.add(curr.amount!),
    new BN(0)
  )
  const possibleGrantProposals = Object.values(proposals).filter(
    (x) =>
      x.account.governance.toBase58() === MANGO_DAO_TREASURY &&
      x.account.accountType === GovernanceAccountType.ProposalV2
  )
  const currentMonthName = statsMonths.length ? statsMonths[0] : ''
  const vestingThisMonth =
    currentMonthName && vestPerMonthStats[currentMonthName]
      ? vestPerMonthStats[currentMonthName].reduce(
          (acc, val) => acc.add(val.vestingAmount),
          new BN(0)
        )
      : new BN(0)
  const walletsCount = [
    ...new Set(depositsWithWallets.map((x) => x.wallet.toBase58())),
  ].length
  const mngoValut = governedTokenAccounts.find(
    (x) =>
      x.extensions.mint?.publicKey.toBase58() ===
      realm?.account.communityMint.toBase58()
  )
  const circulatingSupply =
    mngoValut && mint
      ? mint.supply.sub(mngoValut.extensions.amount!)
      : new BN(0)
  const mngoLocked = depositsWithWallets.reduce(
    (acc, curr) => acc.add(curr.deposit.amountDepositedNative),
    new BN(0)
  )
  const mngoLockedWithClawback = depositsWithWallets
    .filter((x) => x.deposit.allowClawback)
    .reduce(
      (acc, curr) => acc.add(curr.deposit.amountDepositedNative),
      new BN(0)
    )
  const calcVestingAmountsPerLastXMonths = (monthsNumber: number) => {
    const depositsWithWalletsSortedByDate = [...depositsWithWallets].sort(
      (x, y) =>
        x.deposit.lockup.startTs.toNumber() * 1000 -
        y.deposit.lockup.startTs.toNumber() * 1000
    )
    const months: dayjs.Dayjs[] = []
    const vestingPerMonth = {}
    const currentDate = dayjs()
    const oldestDate = dayjs().subtract(monthsNumber, 'month')
    for (let i = 0; i < monthsNumber; i++) {
      const date = dayjs().subtract(i, 'month')
      months.push(date)
      vestingPerMonth[date.format('MMM')] = []
    }
    for (const depositWithWallet of depositsWithWalletsSortedByDate) {
      const unixLockupStart =
        depositWithWallet.deposit.lockup.startTs.toNumber() * 1000
      const unixLockupEnd =
        depositWithWallet.deposit.lockup.endTs.toNumber() * 1000
      const isPossibleToVest =
        typeof depositWithWallet.deposit.lockup.kind.monthly !== 'undefined' &&
        currentDate.isAfter(unixLockupStart) &&
        oldestDate.isBefore(unixLockupEnd)

      if (isPossibleToVest) {
        const vestingCount = Math.ceil(
          dayjs(unixLockupEnd).diff(unixLockupStart, 'month', true)
        )
        const vestingAmount = depositWithWallet.deposit.amountInitiallyLockedNative.divn(
          vestingCount
        )
        for (let i = 1; i <= vestingCount; i++) {
          const nextVestinDays = i * DAYS_PER_MONTH
          const vestingDate = dayjs(unixLockupStart).add(nextVestinDays, 'day')
          for (const date of months) {
            if (
              //@ts-ignore
              vestingDate.isBetween(date.startOf('month'), date.endOf('month'))
            ) {
              vestingPerMonth[date.format('MMM')] = [
                ...vestingPerMonth[date.format('MMM')],
                {
                  vestingDate,
                  vestingAmount,
                },
              ]
            }
          }
        }
      }
    }
    return { vestingPerMonth, months }
  }
  const fmtMangoAmount = (val) => {
    const formatter = Intl.NumberFormat('en', {
      notation: 'compact',
    })
    return mint
      ? formatter.format(getMintDecimalAmount(mint!, val).toNumber())
      : '0'
  }

  useEffect(() => {
    const getProposalsInstructions = async () => {
      const accounts = await getProposalsTransactions(
        possibleGrantProposals.map((x) => x.pubkey),
        connection,
        realmInfo!.programId
      )

      const givenGrantsTokenAmounts = accounts
        .filter(
          (x) =>
            x.account.executionStatus === InstructionExecutionStatus.Success
        )
        .flatMap((x) =>
          x.account.instructions
            .filter(
              (x) =>
                x.data[0] === 145 &&
                x.accounts[9].pubkey.toBase58() === MANGO_MINT
            )
            .map((instruction) => {
              const data = vsrClient?.program.coder.instruction.decode(
                Buffer.from(instruction.data)
              )?.data as GrantInstruction | null

              return {
                voterPk: instruction.accounts[1].pubkey,
                amount: data?.amount,
                startTs: data?.startTs,
              }
            })
        )
      setGivenGrantsTokenAmounts(givenGrantsTokenAmounts)
    }
    if (realmInfo?.programId && vsrClient) {
      getProposalsInstructions()
    }
  }, [possibleGrantProposals.length, realmInfo?.programId])
  useEffect(() => {
    const depositsWithWalletsInner: DepositWithWallet[] = []
    for (const voter of voters) {
      const deposits = voter.account.deposits.filter(
        (x) =>
          x.isUsed &&
          typeof x.lockup?.kind.none === 'undefined' &&
          x.votingMintConfigIdx ===
            voteStakeRegistryRegistrar?.votingMints.findIndex(
              (votingMint) =>
                votingMint.mint.toBase58() ===
                realm?.account.communityMint.toBase58()
            )
      )
      for (const deposit of deposits) {
        const depositWithWallet = {
          voter: voter.publicKey,
          wallet: voter.account.voterAuthority,
          deposit: deposit,
        }
        depositsWithWalletsInner.push(depositWithWallet)
      }
    }
    const depositWithWalletSorted = depositsWithWalletsInner.sort(
      (a, b) =>
        b.deposit.amountDepositedNative.toNumber() -
        a.deposit.amountDepositedNative.toNumber()
    )
    setDepositsWithWallets(depositWithWalletSorted)
  }, [voters.length])

  useEffect(() => {
    const getLockedDeposits = async () => {
      const allVoters = await vsrClient?.program.account.voter.all()
      const currentRealmVoters =
        allVoters?.filter(
          (x) =>
            x.account.registrar.toBase58() ===
            voteStakeRegistryRegistrarPk?.toBase58()
        ) || []
      setVoters(currentRealmVoters)
    }

    getLockedDeposits()
  }, [
    vsrClient?.program.programId.toBase58(),
    voteStakeRegistryRegistrarPk?.toBase58(),
  ])
  useEffect(() => {
    const { vestingPerMonth, months } = calcVestingAmountsPerLastXMonths(6)
    const monthsFormat = months.map((x) => x.format('MMM'))
    setVestPerMonthStats(vestingPerMonth)
    setStatsMonths(monthsFormat)
  }, [depositsWithWallets.length])
  useEffect(() => {
    if (depositsWithWallets.length && givenGrantsTokenAmounts.length) {
      const currentlyUnlocked = new BN(0)
      for (const depostiWithVoter of givenGrantsTokenAmounts) {
        const grantDeposit = depositsWithWallets.find((x) => {
          return (
            x.deposit.amountInitiallyLockedNative.cmp(
              depostiWithVoter.amount!
            ) === 0 &&
            x.deposit.lockup.startTs.cmp(depostiWithVoter.startTs!) === 0 &&
            x.voter.toBase58() === depostiWithVoter.voterPk.toBase58()
          )
        })
        if (grantDeposit) {
          currentlyUnlocked.iadd(
            grantDeposit.deposit.amountInitiallyLockedNative.sub(
              grantDeposit.deposit.amountDepositedNative
            )
          )
        } else {
          currentlyUnlocked.iadd(depostiWithVoter.amount!)
        }
      }
      setUnlockedFromGrants(currentlyUnlocked)
    }
  }, [depositsWithWallets.length, givenGrantsTokenAmounts.length])
  useEffect(() => {
    const mngoPerpMarket = async () => {
      const GROUP = connection.cluster === 'devnet' ? 'devnet.2' : 'mainnet.1'
      const groupConfig = Config.ids().getGroupWithName(GROUP)!
      const client = new MangoClient(
        connection.current,
        groupConfig.mangoProgramId
      )
      const group = await client.getMangoGroup(groupConfig.publicKey)
      const perpMarkets = await Promise.all([
        ...groupConfig!.perpMarkets.map((x) =>
          group.loadPerpMarket(
            connection.current,
            x.marketIndex,
            x.baseDecimals,
            x.quoteDecimals
          )
        ),
      ])

      const emissionPerMonth = perpMarkets
        .reduce(
          (acc, next) => acc.iadd(next.liquidityMiningInfo.mngoPerPeriod),
          new BN(0)
        )
        .muln(SECS_PER_MONTH)
        .div(perpMarkets[0].liquidityMiningInfo.targetPeriodLength)
      setLiqudiityMiningEmissionPerMonth(emissionPerMonth)
    }
    mngoPerpMarket()
  }, [connection.cluster])
  useEffect(() => {
    setPaginatedWallets(paginateWallets(0))
    pagination?.current?.setPage(0)
  }, [JSON.stringify(filteredDepositWithWallets)])
  const onPageChange = (page) => {
    setPaginatedWallets(paginateWallets(page))
  }
  const paginateWallets = (page) => {
    return filteredDepositWithWallets.slice(
      page * walletsPerPage,
      (page + 1) * walletsPerPage
    )
  }
  return (
    <div className="bg-bkg-2 rounded-lg p-4 md:p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <div className="mb-4">
            <PreviousRouteBtn />
          </div>
          <div className="border-b border-fgd-4 flex flex-col md:flex-row justify-between pb-4">
            <div className="flex items-center mb-2 md:mb-0 py-2">
              {realmInfo?.ogImage ? (
                <img src={realmInfo?.ogImage} className="h-8 mr-3 w-8"></img>
              ) : null}
              <div>
                <p>{realmInfo?.displayName}</p>
                <h1 className="mb-0">Stats</h1>
              </div>
            </div>
          </div>
          <div className="flex pt-5">
            <div className="flex flex-col w-1/3">
              <InfoBox
                title="Circulating supply"
                val={circulatingSupply}
              ></InfoBox>
              <InfoBox
                tooltip="Total current amount of MNGO locked"
                title="Total MNGO Locked"
                val={mngoLocked}
              ></InfoBox>
              <InfoBox
                title="Locked with clawback"
                tooltip="Currently locked MNGO that DAO can clawback to treasury vault"
                val={mngoLockedWithClawback}
              ></InfoBox>
              <InfoBox
                tooltip="Historical total amount of MNGO granted to contributors "
                title="Total amount from grants"
                val={givenGrantsTokenAmount}
              ></InfoBox>
              <InfoBox
                title="Liquidity mining emission per month"
                tooltip="Total MNGO emission from all perp markets per month"
                val={liquidityMiningEmissionPerMonth}
              ></InfoBox>
            </div>
            <div className="w-2/3">
              <div>
                <div className="flex pl-8">
                  <InfoBox
                    className="w-1/2 mr-3"
                    title="Vesting this month"
                    val={vestingThisMonth}
                  ></InfoBox>

                  <InfoBox
                    className="w-1/2"
                    tooltip="Historical total amount unlocked from grants"
                    title="Unlocked from grants"
                    val={unlockedFromGrants}
                  ></InfoBox>
                </div>
                <div className="border border-fgd-4 p-3 rounded-md ml-8">
                  <div className="pl-8">MNGO Vesting vs. Time</div>
                  <div style={{ height: '279px' }}>
                    <VestingVsTime
                      data={[
                        ...statsMonths.map((x) => {
                          return {
                            month: x,
                            amount: vestPerMonthStats[x]
                              .reduce((acc, curr) => {
                                return acc.add(curr.vestingAmount)
                              }, new BN(0))
                              .toNumber(),
                          }
                        }),
                      ].reverse()}
                      fmtMangoAmount={fmtMangoAmount}
                    ></VestingVsTime>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <div className="flex items-center">
              Members with Locked MNGO ({walletsCount}){' '}
              <div className="ml-auto">
                <Input
                  style={{ maxWidth: '200px' }}
                  className="pl-8"
                  type="text"
                  placeholder="Search by wallet"
                  value={search}
                  noMaxWidth
                  onChange={(e) => {
                    return setSearch(e.target.value)
                  }}
                  prefix={<SearchIcon className="h-5 w-5 text-fgd-3" />}
                />
              </div>
            </div>
            <div className="flex flex-col mt-4">
              <div className="grid grid-cols-4 text-fgd-3 pb-1 px-2">
                <div>Address</div>
                <div>Lock type</div>
                <div>Lock duration</div>
                <div>MNGO Locked</div>
              </div>
              {paginatedWallets.map((x, index) => (
                <LockTokenRow
                  index={index}
                  depositWithWallet={x}
                  key={index}
                ></LockTokenRow>
              ))}
              <div>
                <PaginationComponent
                  ref={pagination}
                  totalPages={Math.ceil(
                    filteredDepositWithWallets.length / walletsPerPage
                  )}
                  onPageChange={onPageChange}
                ></PaginationComponent>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LockTokenStats
