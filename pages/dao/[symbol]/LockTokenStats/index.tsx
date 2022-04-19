import {
  Config,
  MangoClient,
  PerpMarket,
} from '@blockworks-foundation/mango-client'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import useRealm from '@hooks/useRealm'
import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { fmtMintAmount } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import { Deposit, LockupType } from 'VoteStakeRegistry/sdk/accounts'
import {
  DAYS_PER_MONTH,
  getMinDurationFmt,
  getTimeLeftFromNowFmt,
} from 'VoteStakeRegistry/tools/dateTools'
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)
interface DepositWithWallet {
  voter: PublicKey
  wallet: PublicKey
  deposit: Deposit
}

const LockTokenStats = () => {
  const { realmInfo, realm, mint } = useRealm()
  const connection = useWalletStore((s) => s.connection)
  const governedTokenAccounts = useGovernanceAssetsStore(
    (s) => s.governedTokenAccounts
  )
  const [perpMarket, setPerpMarket] = useState<PerpMarket | null>(null)
  const [vestPerMonthStats, setVestPerMonthStats] = useState<{
    [key: string]: { vestingDate: dayjs.Dayjs; vestingAmount: BN }[]
  }>({})
  const [statsMonths, setStatsMonths] = useState<string[]>([])
  const currentMonthName = statsMonths.length ? statsMonths[0] : ''
  const vestingThisMonth =
    currentMonthName && vestPerMonthStats[currentMonthName]
      ? vestPerMonthStats[currentMonthName].reduce(
          (acc, val) => acc.add(val.vestingAmount),
          new BN(0)
        )
      : new BN(0)
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const voteStakeRegistryRegistrarPk = useVotePluginsClientStore(
    (s) => s.state.voteStakeRegistryRegistrarPk
  )
  const voteStakeRegistryRegistrar = useVotePluginsClientStore(
    (s) => s.state.voteStakeRegistryRegistrar
  )
  const [voters, setVoters] = useState<
    {
      publicKey: PublicKey
      account: any
    }[]
  >([])
  const [depositsWithWallets, setDepositsWithWallets] = useState<
    DepositWithWallet[]
  >([])
  const walletsCount = [
    ...new Set(depositsWithWallets.map((x) => x.wallet.toBase58())),
  ].length
  const fmtMangoAmount = (val) => {
    return mint ? fmtMintAmount(mint!, val) : '0'
  }
  const vestingThisMonthFmt = fmtMangoAmount(vestingThisMonth)
  const mngoValut = governedTokenAccounts.find(
    (x) =>
      x.extensions.mint?.publicKey.toBase58() ===
      realm?.account.communityMint.toBase58()
  )
  const circulatingSupply =
    mngoValut && mint
      ? mint.supply.sub(mngoValut.extensions.amount!)
      : new BN(0)
  const circulatingSupplyFmt = fmtMangoAmount(circulatingSupply)
  const mngoLocked = depositsWithWallets.reduce(
    (acc, curr) => acc.add(curr.deposit.amountDepositedNative),
    new BN(0)
  )
  const mngoLockedFmt = fmtMangoAmount(mngoLocked)
  const mngoLockedWithClawback = depositsWithWallets
    .filter((x) => x.deposit.allowClawback)
    .reduce(
      (acc, curr) => acc.add(curr.deposit.amountDepositedNative),
      new BN(0)
    )
  const mngoLockedWithClawbackFmt = fmtMangoAmount(mngoLockedWithClawback)
  const calcVestingAmountsPerLastXMonths = (monthsNumber: number) => {
    const months: dayjs.Dayjs[] = []
    const vestingPerMonth = {}
    const currentDate = dayjs()
    const oldestDate = dayjs().subtract(monthsNumber, 'month')
    for (let i = 0; i < monthsNumber; i++) {
      const date = dayjs().subtract(i, 'month')
      months.push(date)
      vestingPerMonth[date.format('MMM')] = []
    }
    for (const vestedDeposit of depositsWithWallets) {
      const unixLockupStart =
        vestedDeposit.deposit.lockup.startTs.toNumber() * 1000
      const unixLockupEnd = vestedDeposit.deposit.lockup.endTs.toNumber() * 1000
      const isPossibleToVest =
        typeof vestedDeposit.deposit.lockup.kind.monthly !== 'undefined' &&
        currentDate.isAfter(unixLockupStart) &&
        oldestDate.isBefore(unixLockupEnd)
      if (isPossibleToVest) {
        const vestingCount = Math.ceil(
          dayjs(unixLockupEnd).diff(unixLockupStart, 'month', true)
        )
        const vestingAmount = vestedDeposit.deposit.amountInitiallyLockedNative.divn(
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

  useEffect(() => {
    const depositsWithWallets: DepositWithWallet[] = []
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
        depositsWithWallets.push(depositWithWallet)
      }
    }
    setDepositsWithWallets(
      depositsWithWallets.sort((a, b) =>
        b.deposit.amountDepositedNative
          .sub(a.deposit.amountDepositedNative)
          .toNumber()
      )
    )
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
    const mngoPerpMarket = async () => {
      const GROUP = connection.cluster === 'devnet' ? 'devnet.2' : 'mainnet.1'
      const groupConfig = Config.ids().getGroupWithName(GROUP)!
      const marketConfig = groupConfig!.perpMarkets.find(
        (x) => x.baseSymbol === 'MNGO'
      )!
      const client = new MangoClient(
        connection.current,
        groupConfig.mangoProgramId
      )
      const group = await client.getMangoGroup(groupConfig.publicKey)

      const [perpMarket] = await Promise.all([
        group.loadPerpMarket(
          connection.current,
          marketConfig.marketIndex,
          marketConfig.baseDecimals,
          marketConfig.quoteDecimals
        ),
        group.loadRootBanks(connection.current),
      ])
      setPerpMarket(perpMarket)
    }
    mngoPerpMarket()
  }, [connection.cluster])
  const maxDepthUi = perpMarket
    ? (perpMarket.liquidityMiningInfo.maxDepthBps.toNumber() *
        perpMarket.baseLotSize.toNumber()) /
      Math.pow(10, perpMarket.baseDecimals)
    : 0
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
          <div className="flex">
            <div className="flex flex-col w-1/3">
              <div>
                Circulating supply
                <div>{circulatingSupplyFmt}</div>
              </div>
              <div>
                MNGO Locked
                <div>{mngoLockedFmt}</div>
              </div>
              <div>
                Locked with clawback
                <div>{mngoLockedWithClawbackFmt}</div>
              </div>
              <div>
                Vesting this month
                <div>{vestingThisMonthFmt}</div>
              </div>
              <div>
                Liquidity mining emissions
                <div>{maxDepthUi}</div>
              </div>
              <div></div>
            </div>
            <div className="w-2/3">asdasd</div>
          </div>
          <div className="pt-4">
            <div>Members with Locked MNGO ({walletsCount})</div>
            <div className="flex flex-col">
              <div className="grid grid-cols-4">
                <div>Address</div>
                <div>Lock type</div>
                <div>Lock duration</div>
                <div>MNGO Locked</div>
              </div>
              {depositsWithWallets.map((x, index) => (
                <LockTokenRow depositWithWallet={x} key={index}></LockTokenRow>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const LockTokenRow = ({
  depositWithWallet,
}: {
  depositWithWallet: DepositWithWallet
}) => {
  const { mint } = useRealm()

  const type = Object.keys(
    depositWithWallet.deposit.lockup.kind
  )[0] as LockupType
  const typeName = type !== 'monthly' ? type : 'Vested'
  const isConstant = type === 'constant'
  const lockedTokens = mint
    ? fmtMintAmount(mint!, depositWithWallet.deposit.amountDepositedNative)
    : '0'
  const abbreviateWalletAddress = abbreviateAddress(depositWithWallet.wallet)
  return (
    <div className="grid grid-cols-4">
      <div>{abbreviateWalletAddress}</div>
      <div>{typeName}</div>
      <div>
        {isConstant
          ? getMinDurationFmt(depositWithWallet.deposit as any)
          : getTimeLeftFromNowFmt(depositWithWallet.deposit as any)}
      </div>
      <div>{lockedTokens}</div>
    </div>
  )
}

export default LockTokenStats
