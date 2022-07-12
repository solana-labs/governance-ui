import Button, { LinkButton } from '@components/Button'
import { getExplorerUrl } from '@components/explorer/tools'
import { getAccountName, WSOL_MINT } from '@components/instructions/tools'
import Modal from '@components/Modal'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress, fmtUnixTime } from '@utils/formatting'
import BN from 'bn.js'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import AccountHeader from './AccountHeader'
import DepositNFT from './DepositNFT'
import SendTokens from './SendTokens'
import {
  ExternalLinkIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import Tooltip from '@components/Tooltip'
import ConvertToMsol from './ConvertToMsol'
import ConvertToStSol from './ConvertToStSol'
import useStrategiesStore from 'Strategies/store/useStrategiesStore'
import DepositModal from 'Strategies/components/DepositModal'
import { SolendStrategy, TreasuryStrategy } from 'Strategies/types/types'
import BigNumber from 'bignumber.js'
import { MangoAccount } from '@blockworks-foundation/mango-client'
import {
  calculateAllDepositsInMangoAccountsForMint,
  MANGO,
  tryGetMangoAccountsForOwner,
} from 'Strategies/protocols/mango/tools'
import useMarketStore from 'Strategies/store/marketStore'
import LoadingRows from './LoadingRows'
import TradeOnSerum, { TradeOnSerumProps } from './TradeOnSerum'
import { AccountType } from '@utils/uiTypes/assets'
import CreateAta from './CreateAta'
import {
  cTokenExchangeRate,
  getReserveData,
  SOLEND,
} from 'Strategies/protocols/solend'
import tokenService from '@utils/services/token'
import { EVERLEND } from '../../Strategies/protocols/everlend/tools'
import { findAssociatedTokenAccount } from '@everlend/common'

type InvestmentType = TreasuryStrategy & {
  investedAmount: number
}

const AccountOverview = () => {
  const router = useRouter()
  const { ownTokenRecord, ownCouncilTokenRecord } = useRealm()
  const {
    governedTokenAccounts,
    auxiliaryTokenAccounts,
  } = useGovernanceAssets()
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const nftsPerPubkey = useTreasuryAccountStore((s) => s.governanceNfts)
  const nftsCount =
    currentAccount?.governance && currentAccount.isNft
      ? nftsPerPubkey[currentAccount?.governance?.pubkey.toBase58()]?.length
      : 0
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const isNFT = currentAccount?.isNft
  const isSol = currentAccount?.isSol
  const [loading, setLoading] = useState(true)
  const isSplToken = currentAccount?.type === AccountType.TOKEN
  const isAuxiliaryAccount = currentAccount?.type === AccountType.AuxiliaryToken
  const { canUseTransferInstruction } = useGovernanceAssets()
  const { connection, connected } = useWalletStore((s) => s)
  const recentActivity = useTreasuryAccountStore((s) => s.recentActivity)
  const isLoadingRecentActivity = useTreasuryAccountStore(
    (s) => s.isLoadingRecentActivity
  )
  const market = useMarketStore((s) => s)
  const [mngoAccounts, setMngoAccounts] = useState<MangoAccount[]>([])
  const [openNftDepositModal, setOpenNftDepositModal] = useState(false)
  const [openCommonSendModal, setOpenCommonSendModal] = useState(false)
  const [openMsolConvertModal, setOpenMsolConvertModal] = useState(false)
  const [openStSolConvertModal, setOpenStSolConvertModal] = useState(false)
  const [openAtaModal, setOpenAtaModal] = useState(false)
  const accountPublicKey = currentAccount?.extensions.transferAddress
  const strategies = useStrategiesStore((s) => s.strategies)
  const [accountInvestments, setAccountInvestments] = useState<
    InvestmentType[]
  >([])
  const [showStrategies, setShowStrategies] = useState(false)
  const [
    proposedInvestment,
    setProposedInvestment,
  ] = useState<InvestmentType | null>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [
    tradeSerumInfo,
    setTradeSerumInfo,
  ] = useState<TradeOnSerumProps | null>(null)
  const strategyMint = currentAccount?.isSol
    ? WSOL_MINT
    : currentAccount?.extensions.token?.account.mint.toString()
  const visibleInvestments = strategies.filter(
    (strat) => strat.handledMint === strategyMint
  )
  const visibleAccounts = accountInvestments.filter(
    (strat) => strat.handledMint === strategyMint
  )

  useEffect(() => {
    const getSlndCTokens = async () => {
      const accounts = [
        ...governedTokenAccounts,
        ...auxiliaryTokenAccounts,
        ...(currentAccount?.isSol ? [currentAccount] : []),
      ]

      const solendStrategy = visibleInvestments.filter(
        (strat) => strat.protocolName === SOLEND
      )[0]

      const relevantAccs = accounts
        .map((acc) => {
          const reserve = (solendStrategy as SolendStrategy)?.reserves.find(
            (reserve) =>
              reserve.mintAddress === strategyMint &&
              reserve.collateralMintAddress ===
                acc.extensions.mint?.publicKey.toBase58()
          )
          if (!reserve || !solendStrategy) return null

          return {
            acc,
            reserve,
          }
        })
        .filter(Boolean)

      const reserveStats = await getReserveData(
        relevantAccs.map((data) => data!.reserve.reserveAddress)
      )

      return relevantAccs.map((data) => {
        const reserve = data!.reserve
        const account = data!.acc

        const stat = reserveStats.find(
          (stat) => stat.reserve.lendingMarket === reserve.marketAddress
        )!

        return {
          ...solendStrategy,
          apy: `${reserve.supplyApy.toFixed(2)}%`,
          protocolName: solendStrategy.protocolName,
          strategySubtext: `${reserve.marketName} Pool`,
          investedAmount:
            ((account.extensions.amount?.toNumber() ?? 0) *
              cTokenExchangeRate(stat)) /
            10 ** reserve.decimals,
        }
      }) as Array<InvestmentType>
    }

    const handleGetMangoAccounts = async () => {
      const currentAccountMint = currentAccount?.extensions.token?.account.mint
      const currentPositions = calculateAllDepositsInMangoAccountsForMint(
        mngoAccounts,
        currentAccountMint!,
        market
      )

      if (currentPositions > 0) {
        return strategies
          .map((invest) => ({
            ...invest,
            investedAmount: currentPositions,
          }))
          .filter((x) => x.protocolName === MANGO)
      }

      return []
    }

    const handleEverlendAccounts = async (): Promise<InvestmentType[]> => {
      const everlendStrategy = visibleInvestments.filter(
        (strat) => strat.protocolName === EVERLEND
      )[0]

      const tokenMintATA = await findAssociatedTokenAccount(
        isSol
          ? currentAccount!.pubkey
          : currentAccount!.extensions!.token!.account.owner,

        new PublicKey(
          (everlendStrategy as TreasuryStrategy & { poolMint: string }).poolMint
        )
      )
      const tokenMintATABalance = await connection.current.getTokenAccountBalance(
        tokenMintATA
      )

      return [
        {
          ...everlendStrategy,
          investedAmount: Number(tokenMintATABalance.value.uiAmount),
        },
      ].filter((strat) => strat.investedAmount !== 0)
    }

    const loadData = async () => {
      const requests = [] as Array<Promise<Array<InvestmentType>>>
      if (visibleInvestments.filter((x) => x.protocolName === MANGO).length) {
        requests.push(handleGetMangoAccounts())
      }
      if (visibleInvestments.filter((x) => x.protocolName === SOLEND).length) {
        requests.push(getSlndCTokens())
      }

      if (
        visibleInvestments.filter((x) => x.protocolName === EVERLEND).length
      ) {
        requests.push(handleEverlendAccounts())
      }

      const results = await Promise.all(requests)
      setLoading(false)

      setAccountInvestments(results.flatMap((x) => x))
    }

    loadData()
  }, [currentAccount, mngoAccounts])

  useEffect(() => {
    const getMangoAcccounts = async () => {
      const accounts = await tryGetMangoAccountsForOwner(
        market,
        currentAccount!.governance!.pubkey
      )
      setMngoAccounts(accounts ? accounts : [])
    }
    if (currentAccount) {
      getMangoAcccounts()
    }
  }, [currentAccount, market])

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  useEffect(() => {
    if (visibleInvestments.length && visibleAccounts.length === 0) {
      setShowStrategies(true)
    } else {
      setShowStrategies(false)
    }
  }, [currentAccount, visibleAccounts.length, visibleInvestments.length])

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setIsCopied(true)
  }

  if (!currentAccount) {
    return null
  }

  const deposits = visibleAccounts.reduce(
    (acc, account) => ({
      ...acc,
      [account.protocolName]:
        (acc[account.protocolName] ?? 0) + account.investedAmount,
    }),
    {}
  )

  const StaticInvestmentsComponent = () => {
    const currentTokenImg = currentAccount.isToken
      ? tokenService.getTokenInfo(
          currentAccount.extensions.mint!.publicKey.toBase58()
        )?.logoURI || ''
      : ''
    const marinadeStrategy = {
      liquidity: 0,
      protocolSymbol: '',
      apy: '',
      protocolName: 'Marinade',
      handledMint: '',
      handledTokenSymbol: '',
      handledTokenImgSrc:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      protocolLogoSrc:
        'https://raw.githubusercontent.com/LP-Finance-Inc/token-image/main/msol.png',
      strategyName: 'Stake',
      strategyDescription: '',
      createProposalFcn: () => null,
    }
    const lidoStrategy = {
      liquidity: 0,
      protocolSymbol: '',
      apy: '',
      protocolName: 'Lido',
      handledMint: '',
      handledTokenSymbol: '',
      handledTokenImgSrc:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      protocolLogoSrc:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png',
      strategyName: 'Stake',
      strategyDescription: '',
      createProposalFcn: () => null,
    }
    const serumStrategy = {
      liquidity: 0,
      protocolSymbol: '',
      apy: '',
      protocolName: 'Serum',
      handledMint: '',
      handledTokenSymbol: '',
      handledTokenImgSrc: currentTokenImg,
      protocolLogoSrc:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png',
      strategyName: 'Trade',
      strategyDescription: '',
      createProposalFcn: () => null,
    }
    return (
      <>
        {isSol && (
          <StrategyCard
            onClick={() => setOpenMsolConvertModal(true)}
            currentDeposits={0}
            strat={marinadeStrategy}
          ></StrategyCard>
        )}
        {isSol && (
          <StrategyCard
            onClick={() => setOpenStSolConvertModal(true)}
            currentDeposits={0}
            strat={lidoStrategy}
          ></StrategyCard>
        )}
        {isSplToken && (
          <StrategyCard
            onClick={() => setTradeSerumInfo({ tokenAccount: currentAccount })}
            currentDeposits={0}
            strat={serumStrategy}
          ></StrategyCard>
        )}
      </>
    )
  }
  const NoInvestmentsIndicator = () => {
    return (
      <>
        <div className="p-4 border rounded-md border-fgd-4">
          <p className="text-center text-fgd-3">
            {loading ? 'Loading...' : 'No investments for this account'}
          </p>
        </div>
      </>
    )
  }
  return (
    <>
      <div className="flex items-center justify-between py-2 mb-2">
        <h2 className="mb-0 font-bold">
          {currentAccount?.extensions.transferAddress &&
          getAccountName(currentAccount.extensions.transferAddress)
            ? getAccountName(currentAccount.extensions.transferAddress)
            : accountPublicKey &&
              abbreviateAddress(accountPublicKey as PublicKey)}
        </h2>
        <div className="flex items-center space-x-4">
          {isNFT && (
            <p
              className="cursor-pointer default-transition text-primary-light hover:text-primary-dark"
              onClick={() => {
                const url = fmtUrlWithCluster(`/dao/${symbol}/gallery`)
                router.push(url)
              }}
            >
              View Collection
            </p>
          )}
          <a
            className="flex items-center text-sm default-transition text-primary-light hover:text-primary-dark"
            href={
              accountPublicKey
                ? getExplorerUrl(connection.cluster, accountPublicKey)
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Explorer
            <ExternalLinkIcon className="flex-shrink-0 w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
      <AccountHeader />
      <div
        className={`flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 pb-8 px-4 justify-center`}
      >
        <div className="relative w-full max-w-lg">
          {isCopied && (
            <div className="absolute p-2 text-xs transform -translate-x-1/2 rounded bg-bkg-1 left-1/2 text-fgd-3 -top-10">
              Copied to Clipboard
            </div>
          )}
          <Button
            className="w-full max-w-lg"
            onClick={() =>
              isNFT
                ? setOpenNftDepositModal(true)
                : handleCopyAddress(
                    currentAccount?.extensions.transferAddress!.toBase58()
                  )
            }
          >
            {isNFT ? 'Deposit' : 'Copy Deposit Address'}
          </Button>
        </div>
        {!isAuxiliaryAccount && (
          <Button
            tooltipMessage={
              !canUseTransferInstruction
                ? 'You need to have connected wallet with ability to create token transfer proposals'
                : isNFT && nftsCount === 0
                ? 'Please deposit nfts first'
                : ''
            }
            className="w-full max-w-lg"
            onClick={() => setOpenCommonSendModal(true)}
            disabled={!canUseTransferInstruction || (isNFT && nftsCount === 0)}
          >
            Send
          </Button>
        )}
        {isSol ? (
          <Button
            className="w-full max-w-lg"
            onClick={() => setOpenAtaModal(true)}
            disabled={!connected || !(ownTokenRecord || ownCouncilTokenRecord)}
          >
            <Tooltip
              content={
                !connected
                  ? 'You need to be connected to your wallet'
                  : !(ownTokenRecord || ownCouncilTokenRecord)
                  ? 'You need to be member of dao'
                  : ''
              }
            >
              <div>Add new token account</div>
            </Tooltip>
          </Button>
        ) : null}
      </div>
      {!isAuxiliaryAccount && (
        <div className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="mb-0">
              {showStrategies ? 'Available Investments' : 'Current Investments'}
            </h3>
            <LinkButton
              className="flex items-center text-primary-light whitespace-nowrap"
              onClick={() => setShowStrategies(!showStrategies)}
            >
              {showStrategies ? (
                <>
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  Investments
                </>
              )}
            </LinkButton>
          </div>
          {showStrategies ? (
            <>
              {visibleInvestments.length > 0 &&
                visibleInvestments.map((strat, i) => (
                  <StrategyCard
                    key={strat.handledTokenSymbol + i}
                    currentDeposits={deposits[strat.protocolName] ?? 0}
                    onClick={() => {
                      setProposedInvestment({
                        ...strat,
                        investedAmount: deposits[strat.protocolName] ?? 0,
                      })
                    }}
                    strat={strat}
                  />
                ))}
              <StaticInvestmentsComponent></StaticInvestmentsComponent>
            </>
          ) : visibleAccounts.length > 0 ? (
            visibleAccounts.map((strat, i) => (
              <StrategyCard
                key={strat.handledTokenSymbol + i}
                strat={strat}
                currentDeposits={strat.investedAmount}
              />
            ))
          ) : (
            <NoInvestmentsIndicator></NoInvestmentsIndicator>
          )}
        </div>
      )}

      <h3 className="mb-4">Recent Activity</h3>
      <div>
        {isLoadingRecentActivity ? (
          <LoadingRows />
        ) : recentActivity.length > 0 ? (
          recentActivity.map((activity) => (
            <a
              href={
                activity.signature
                  ? getExplorerUrl(connection.cluster, activity.signature, 'tx')
                  : ''
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 mb-2 text-sm border rounded-md border-fgd-4 default-transition hover:bg-bkg-3 hover:border-primary-light text-th-fgd-1"
              key={activity.signature}
            >
              <div>{activity.signature.substring(0, 12)}...</div>
              <div className="flex items-center">
                <div className="text-sm text-fgd-3">
                  {activity.blockTime
                    ? fmtUnixTime(new BN(activity.blockTime))
                    : null}
                </div>
                <ExternalLinkIcon className="w-4 h-4 ml-2 text-primary-light" />
              </div>
            </a>
          ))
        ) : (
          <div className="p-4 border rounded-md border-fgd-4">
            <p className="text-center text-fgd-3">No recent activity</p>
          </div>
        )}
      </div>
      {proposedInvestment && (
        <DepositModal
          governedTokenAccount={currentAccount}
          mangoAccounts={mngoAccounts}
          currentPosition={proposedInvestment.investedAmount}
          apy={proposedInvestment.apy}
          handledMint={proposedInvestment.handledMint}
          onClose={() => {
            setProposedInvestment(null)
          }}
          proposedInvestment={proposedInvestment}
          protocolName={proposedInvestment.protocolName}
          protocolLogoSrc={proposedInvestment.protocolLogoSrc}
          handledTokenName={proposedInvestment.handledTokenSymbol}
          strategyName={proposedInvestment.strategyName}
          createProposalFcn={proposedInvestment.createProposalFcn}
        />
      )}
      {openNftDepositModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenNftDepositModal(false)
          }}
          isOpen={openNftDepositModal}
        >
          <DepositNFT
            onClose={() => {
              setOpenNftDepositModal(false)
            }}
          ></DepositNFT>
        </Modal>
      )}
      {openCommonSendModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenCommonSendModal(false)
          }}
          isOpen={openCommonSendModal}
        >
          <SendTokens />
        </Modal>
      )}
      {openMsolConvertModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenMsolConvertModal(false)
          }}
          isOpen={openMsolConvertModal}
        >
          <ConvertToMsol />
        </Modal>
      )}
      {openStSolConvertModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenStSolConvertModal(false)
          }}
          isOpen={openStSolConvertModal}
        >
          <ConvertToStSol />
        </Modal>
      )}
      {openAtaModal && isSol && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenAtaModal(false)
          }}
          isOpen={openAtaModal}
        >
          <CreateAta
            createCallback={() => setOpenAtaModal(false)}
            owner={currentAccount.extensions.transferAddress!}
            governancePk={currentAccount.governance.pubkey}
          />
        </Modal>
      )}
      {tradeSerumInfo && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setTradeSerumInfo(null)
          }}
          isOpen={!!tradeSerumInfo}
        >
          <TradeOnSerum {...tradeSerumInfo} />
        </Modal>
      )}
    </>
  )
}

interface StrategyCardProps {
  onClick?: () => void
  strat: TreasuryStrategy
  currentDeposits: number
}

const StrategyCard = ({
  onClick,
  strat,
  currentDeposits,
}: StrategyCardProps) => {
  const {
    handledTokenImgSrc,
    strategyName,
    protocolName,
    strategySubtext,
    handledTokenSymbol,
    apy,
  } = strat
  const currentPositionFtm = new BigNumber(
    currentDeposits.toFixed(2)
  ).toFormat()
  return (
    <div className="flex items-center justify-between p-4 mt-2 border rounded-md border-fgd-4">
      <div className="flex items-center">
        {strat.protocolLogoSrc ? (
          <img
            src={strat.protocolLogoSrc}
            style={{
              marginRight: -8,
            }}
            className="h-8 rounded-full w-8"
          ></img>
        ) : null}
        {handledTokenImgSrc ? (
          <img
            src={strat.handledTokenImgSrc}
            className="w-8 h-8 mr-3 rounded-full"
          ></img>
        ) : (
          <div className="w-8 h-8 mr-3 rounded-full"></div>
        )}
        <div>
          <p className="text-xs">{`${strategyName} ${handledTokenSymbol} on ${protocolName}${
            strategySubtext ? ` - ${strategySubtext}` : ''
          }`}</p>
          {(handledTokenSymbol || currentPositionFtm !== '0') && (
            <p className="font-bold text-fgd-1">{`${currentPositionFtm} ${handledTokenSymbol}`}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          {apy && <p className="text-xs">Interest Rate</p>}
          <p className="font-bold text-green">{apy}</p>
        </div>
        {onClick ? <Button onClick={onClick}>{`Propose`}</Button> : null}
      </div>
    </div>
  )
}

export default AccountOverview
