import Input from '@components/inputs/Input'
import { GrantInstruction } from '@components/instructions/programs/voteStakeRegistry'
import { MANGO_DAO_TREASURY } from '@components/instructions/tools'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { SearchIcon, UserCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { BN, BorshInstructionCoder } from '@coral-xyz/anchor'
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
import { DAYS_PER_MONTH } from 'VoteStakeRegistry/tools/dateTools'
import InfoBox from 'VoteStakeRegistry/components/LockTokenStats/InfoBox'
import { AddressImage, DisplayAddress } from '@cardinal/namespaces-components'
import { LockupType } from 'VoteStakeRegistry/sdk/accounts'
import {
  getMinDurationFmt,
  getTimeLeftFromNowFmt,
} from 'VoteStakeRegistry/tools/dateTools'
import {
  DepoistWithVoter,
  DepositWithWallet,
  getProposalsTransactions,
} from 'VoteStakeRegistry/components/LockTokenStats/tools'
import PaginationComponent from '@components/Pagination'
import {
  ExpandableRow,
  Table,
  Td,
  Th,
  TrBody,
  TrHead,
} from '@components/TableElements'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { abbreviateAddress } from '@utils/formatting'
import { getDepositType } from 'VoteStakeRegistry/tools/deposits'
const VestingVsTime = dynamic(
  () => import('VoteStakeRegistry/components/LockTokenStats/VestingVsTime'),
  {
    ssr: false,
  }
)
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

const mainMangoVaultPk = 'Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z'

const LockTokenStats = () => {
  const walletsPerPage = 10
  const pagination = useRef<{ setPage: (val) => void }>(null)
  const { realmInfo, realm, symbol, mint, proposals } = useRealm()
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
  const [liquidityMiningEmissionPerMonth] = useState(new BN(0))
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
        realm?.account.communityMint.toBase58() &&
      x.extensions.transferAddress?.toBase58() === mainMangoVaultPk
  )
  const mngoLocked = depositsWithWallets.reduce(
    (acc, curr) => acc.add(curr.deposit.amountDepositedNative),
    new BN(0)
  )
  console.log(mngoValut)
  const circulatingSupply =
    mngoValut && mint
      ? mint.supply.sub(mngoValut.extensions.amount!).sub(mngoLocked)
      : new BN(0)
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
    // Make sure we capture the full monthly vesting amount for the last month
    const oldestDate = dayjs().add(monthsNumber, 'month').endOf('month')

    for (let i = 0; i < monthsNumber; i++) {
      // add months so we get the current month onward
      const date = dayjs().add(i, 'month')
      months.push(date)
      vestingPerMonth[date.format('MMM')] = []
    }

    for (const depositWithWallet of depositsWithWalletsSortedByDate) {
      const unixLockupStart =
        depositWithWallet.deposit.lockup.startTs.toNumber() * 1000
      const unixLockupEnd =
        depositWithWallet.deposit.lockup.endTs.toNumber() * 1000
      const depositType = getDepositType(depositWithWallet.deposit)

      const finalUnlockDate = dayjs(unixLockupEnd)
      const vestingStart = dayjs(unixLockupStart)

      const monthlyPossibleVest =
        depositType == 'monthly' &&
        finalUnlockDate.isAfter(currentDate) &&
        vestingStart.isBefore(oldestDate)

      const cliffPossibleVest =
        depositType == 'cliff' &&
        finalUnlockDate.isAfter(currentDate) &&
        finalUnlockDate.isBefore(oldestDate)
      const isPossibleToVest = monthlyPossibleVest || cliffPossibleVest

      if (isPossibleToVest) {
        let vestingAmount = new BN(0)
        if (depositType === 'monthly') {
          const vestingCount = Math.ceil(
            dayjs(unixLockupEnd).diff(unixLockupStart, 'month', true)
          )
          vestingAmount = depositWithWallet.deposit.amountInitiallyLockedNative.divn(
            vestingCount
          )
          // Monthly vesting needs to be calculated over time
          for (let i = 1; i <= vestingCount; i++) {
            const nextVestinDays = i * DAYS_PER_MONTH
            const vestingDate = dayjs(unixLockupStart).add(
              nextVestinDays,
              'day'
            )
            for (const date of months) {
              if (
                //@ts-ignore
                vestingDate.isBetween(
                  date.startOf('month'),
                  date.endOf('month')
                )
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
        } else if (depositType === 'cliff') {
          vestingAmount = depositWithWallet.deposit.amountInitiallyLockedNative
          // Find the month the cliff period ends in and bucket it
          for (const date of months) {
            if (
              // @ts-ignore
              finalUnlockDate.isBetween(
                date.startOf('month'),
                date.endOf('month')
              )
            ) {
              vestingPerMonth[date.format('MMM')] = [
                ...vestingPerMonth[date.format('MMM')],
                {
                  finalUnlockDate,
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
  const fmtAmount = (val) => {
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
                x.accounts[9].pubkey.toBase58() ===
                  realm?.account.communityMint.toBase58()
            )
            .map((instruction) => {
              const data = new BorshInstructionCoder(
                vsrClient!.program.idl
              ).decode(Buffer.from(instruction.data))
                ?.data as GrantInstruction | null
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [voters.length])

  useEffect(() => {
    const getLockedDeposits = async () => {
      const allVoters = await vsrClient?.program.account.voter.all([
        {
          memcmp: {
            offset: 40,
            bytes: voteStakeRegistryRegistrarPk!.toBase58(),
          },
        },
      ])
      const currentRealmVoters = allVoters && allVoters.length ? allVoters : []
      setVoters(currentRealmVoters)
    }
    if (vsrClient && voteStakeRegistryRegistrarPk) {
      getLockedDeposits()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    vsrClient?.program.programId.toBase58(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    voteStakeRegistryRegistrarPk?.toBase58(),
  ])
  useEffect(() => {
    const { vestingPerMonth, months } = calcVestingAmountsPerLastXMonths(6)
    const monthsFormat = months.map((x) => x.format('MMM'))
    setVestPerMonthStats(vestingPerMonth)
    setStatsMonths(monthsFormat)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [depositsWithWallets.length, givenGrantsTokenAmounts.length])
  useEffect(() => {
    setPaginatedWallets(paginateWallets(0))
    pagination?.current?.setPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
  const parsedSymbol =
    typeof symbol === 'string' && tryParsePublicKey(symbol)
      ? abbreviateAddress(new PublicKey(symbol))
      : symbol
  const renderAddressName = (wallet) => {
    return (
      <DisplayAddress
        connection={connection.current}
        address={new PublicKey(wallet)}
        height="25px"
        width="100px"
        dark={true}
      />
    )
  }
  const renderAddressImage = (wallet) => (
    <AddressImage
      dark={true}
      connection={connection.current}
      address={new PublicKey(wallet)}
      height="25px"
      width="25px"
      placeholder={<UserCircleIcon className="h-6 text-fgd-3 w-6" />}
    />
  )

  return (
    <div className="bg-bkg-2 rounded-lg p-4 md:p-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="mb-4">
            <PreviousRouteBtn />
          </div>
          <div className="flex items-center mb-2 md:mb-0 py-2">
            {realmInfo?.ogImage ? (
              <img src={realmInfo?.ogImage} className="h-8 mr-3 w-8"></img>
            ) : null}
            <h1 className="mb-0">
              {typeof symbol === 'string' && tryParsePublicKey(symbol)
                ? realm?.account.name
                : symbol}{' '}
              Stats
            </h1>
          </div>
        </div>
        {symbol === 'MNGO' && (
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <InfoBox
              className="h-full"
              title="Circulating Supply"
              val={circulatingSupply}
            />
          </div>
        )}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <InfoBox
            className="h-full"
            tooltip={`Total current amount of ${parsedSymbol} locked`}
            title={`Total ${parsedSymbol} Locked`}
            val={mngoLocked}
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <InfoBox
            className="h-full"
            title="Locked With Clawback"
            tooltip={`Currently locked ${parsedSymbol} that the DAO can clawback to the treasury vault`}
            val={mngoLockedWithClawback}
          />
        </div>
        {symbol === 'MNGO' && (
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <InfoBox
              className="h-full"
              title="Liquidity Mining Emissions P/M"
              tooltip="Total MNGO emissions from all perp markets per month"
              val={liquidityMiningEmissionPerMonth}
            />
          </div>
        )}
        <div className="col-span-12 mt-4">
          <h2>Vesting and Grants</h2>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="flex flex-col md:flex-row md:space-x-4 lg:flex-col lg:space-x-0">
            <InfoBox
              className="mb-4 w-full md:mb-0 lg:mb-4"
              title="Vesting This Month"
              val={vestingThisMonth}
            />
            <InfoBox
              className="mb-4 w-full md:mb-0 lg:mb-4"
              tooltip={`Historical total amount of ${parsedSymbol} granted to contributors`}
              title="Total Amount From Grants"
              val={givenGrantsTokenAmount}
            />
            <InfoBox
              className="w-full"
              tooltip="Historical total amount unlocked from grants"
              title="Total Unlocked From Grants"
              val={unlockedFromGrants}
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <div className="border border-fgd-4 p-3 rounded-md">
            <h3 className="p-3">{parsedSymbol} Vesting vs. Time</h3>
            <div style={{ height: '196px' }}>
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
                ]}
                fmtAmount={fmtAmount}
              ></VestingVsTime>
            </div>
          </div>
        </div>
        <div className="col-span-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 mt-6 w-full">
            <h2 className="mb-3 sm:mb-0">
              Members with Locked {parsedSymbol}{' '}
              <span className="text-sm text-fgd-3 font-normal">
                ({walletsCount})
              </span>
            </h2>
            <div className="w-full sm:w-auto">
              <Input
                className="pl-8 sm:max-w-[240px] w-full"
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
          <div className="hidden md:block">
            <Table>
              <thead>
                <TrHead>
                  <Th>Address</Th>
                  <Th>Lock Type</Th>
                  <Th>Duration</Th>
                  <Th>Amount ({parsedSymbol})</Th>
                </TrHead>
              </thead>
              <tbody>
                {paginatedWallets.map((x, index) => {
                  const fmtMangoAmount = (val) => {
                    return mint
                      ? getMintDecimalAmount(mint!, val).toFormat(0)
                      : '0'
                  }
                  const type = Object.keys(
                    x.deposit.lockup.kind
                  )[0] as LockupType
                  const typeName = type !== 'monthly' ? type : 'Vested'
                  const isConstant = type === 'constant'
                  const lockedTokens = fmtMangoAmount(
                    x.deposit.amountDepositedNative
                  )
                  return (
                    <TrBody key={`${x.deposit}${index}`}>
                      <Td>
                        <div className="underline hover:no-underline hover:cursor-pointer flex items-center">
                          <div className="mr-2">
                            {renderAddressImage(x.wallet)}
                          </div>{' '}
                          {renderAddressName(x.wallet)}
                        </div>
                      </Td>
                      <Td>
                        {typeName.charAt(0).toUpperCase() + typeName.slice(1)}
                      </Td>
                      <Td>
                        {isConstant
                          ? getMinDurationFmt(x.deposit as any)
                          : getTimeLeftFromNowFmt(x.deposit as any)}
                      </Td>
                      <Td>{lockedTokens}</Td>
                    </TrBody>
                  )
                })}
              </tbody>
            </Table>
          </div>
          <div className="border-b border-bkg-4 md:hidden">
            <div className="flex justify-between pb-2 pl-4 pr-12 text-xs text-fgd-3">
              <div>Address</div>
              <div>Amount</div>
            </div>
            {paginatedWallets.map((x, index) => {
              const fmtAmount = (val) => {
                return mint ? getMintDecimalAmount(mint!, val).toFormat(0) : '0'
              }
              const type = Object.keys(x.deposit.lockup.kind)[0] as LockupType
              const typeName = type !== 'monthly' ? type : 'Vested'
              const isConstant = type === 'constant'
              const lockedTokens = fmtAmount(x.deposit.amountDepositedNative)
              return (
                <ExpandableRow
                  buttonTemplate={
                    <div className="flex w-full items-center justify-between text-fgd-2 text-sm">
                      <div className="underline hover:no-underline hover:cursor-pointer flex items-center">
                        <div className="mr-2">
                          {renderAddressImage(x.wallet)}
                        </div>
                        {renderAddressName(x.wallet)}
                      </div>
                      {lockedTokens}
                    </div>
                  }
                  key={`${x.deposit}${index}`}
                  panelTemplate={
                    <div className="grid grid-flow-row grid-cols-2 gap-4">
                      <div className="text-left">
                        <div className="pb-0.5 text-xs text-fgd-3">
                          Lock Type
                        </div>
                        <div className="text-fgd-2 text-sm">
                          {typeName.charAt(0).toUpperCase() + typeName.slice(1)}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="pb-0.5 text-xs text-fgd-3">
                          Duration
                        </div>
                        <div className="text-fgd-2 text-sm">
                          {isConstant
                            ? getMinDurationFmt(x.deposit as any)
                            : getTimeLeftFromNowFmt(x.deposit as any)}
                        </div>
                      </div>
                    </div>
                  }
                />
              )
            })}
          </div>
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
  )
}

export default LockTokenStats
