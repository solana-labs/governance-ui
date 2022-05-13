import Button, { LinkButton } from '@components/Button'
import { getExplorerUrl } from '@components/explorer/tools'
import { getAccountName } from '@components/instructions/tools'
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
import useStrategiesStore from 'Strategies/store/useStrategiesStore'
import DepositModal from 'Strategies/components/DepositModal'
import { TreasuryStrategy } from 'Strategies/types/types'
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

const AccountOverview = () => {
  const router = useRouter()
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
  const isSplToken = currentAccount?.type === AccountType.TOKEN
  const isAuxiliaryAccount = currentAccount?.type === AccountType.AuxiliaryToken
  const connected = useWalletStore((s) => s.connected)
  const { canUseTransferInstruction } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const recentActivity = useTreasuryAccountStore((s) => s.recentActivity)
  const isLoadingRecentActivity = useTreasuryAccountStore(
    (s) => s.isLoadingRecentActivity
  )
  const market = useMarketStore((s) => s)
  const [currentMangoDeposits, setCurrentMangoDeposits] = useState(0)
  const [mngoAccounts, setMngoAccounts] = useState<MangoAccount[]>([])
  const [openNftDepositModal, setOpenNftDepositModal] = useState(false)
  const [openCommonSendModal, setOpenCommonSendModal] = useState(false)
  const [openMsolConvertModal, setOpenMsolConvertModal] = useState(false)
  const [openAtaModal, setOpenAtaModal] = useState(false)
  const accountPublicKey = currentAccount?.extensions.transferAddress
  const strategies = useStrategiesStore((s) => s.strategies)
  const [accountInvestments, setAccountInvestments] = useState<
    TreasuryStrategy[]
  >([])
  const [eligibleInvestments, setEligibleInvestments] = useState<
    TreasuryStrategy[]
  >([])
  const [showStrategies, setShowStrategies] = useState(false)
  const [
    proposedInvestment,
    setProposedInvestment,
  ] = useState<TreasuryStrategy | null>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [
    tradeSerumInfo,
    setTradeSerumInfo,
  ] = useState<TradeOnSerumProps | null>(null)

  useEffect(() => {
    if (strategies.length > 0) {
      const eligibleInvestments = strategies.filter(
        (strat) =>
          strat.handledMint ===
          currentAccount?.extensions.token?.account.mint.toString()
      )
      setEligibleInvestments(eligibleInvestments)
    }
  }, [currentAccount, strategies])
  useEffect(() => {
    const handleGetMangoAccounts = async () => {
      const currentAccountMint = currentAccount?.extensions.token?.account.mint
      const currentPositions = calculateAllDepositsInMangoAccountsForMint(
        mngoAccounts,
        currentAccountMint!,
        market
      )
      setCurrentMangoDeposits(currentPositions)

      if (currentPositions > 0) {
        setAccountInvestments(
          eligibleInvestments.filter((x) => x.protocolName === MANGO)
        )
      } else {
        setAccountInvestments([])
      }
    }
    if (eligibleInvestments.filter((x) => x.protocolName === MANGO).length) {
      handleGetMangoAccounts()
    }
  }, [eligibleInvestments, currentAccount, mngoAccounts])
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
  }, [currentAccount, eligibleInvestments, market])

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setIsCopied(true)
  }

  if (!currentAccount) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2 py-2">
        <h2 className="mb-0">
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
            className="default-transition flex items-center text-primary-light hover:text-primary-dark text-sm"
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
            <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 w-4" />
          </a>
        </div>
      </div>
      <AccountHeader />
      <div
        className={`flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 pb-8 px-4 justify-center`}
      >
        <div className="relative w-full max-w-lg">
          {isCopied && (
            <div className="absolute bg-bkg-1 left-1/2 p-2 rounded text-fgd-3 text-xs transform -translate-x-1/2 -top-10">
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
        {isSplToken && (
          <Button
            tooltipMessage={
              !canUseTransferInstruction
                ? 'You need to have connected wallet with ability to create token transfer proposals'
                : ''
            }
            className="w-full"
            onClick={() => setTradeSerumInfo({ tokenAccount: currentAccount })}
            disabled={!canUseTransferInstruction}
          >
            Trade On Serum
          </Button>
        )}
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
            onClick={() => setOpenMsolConvertModal(true)}
            disabled={!canUseTransferInstruction}
          >
            <Tooltip
              content={
                !canUseTransferInstruction &&
                'You need to be connected to your wallet to have the ability to create a staking proposal'
              }
            >
              <div>Stake with Marinade</div>
            </Tooltip>
          </Button>
        ) : null}
        {isSol ? (
          <Button
            className="w-full max-w-lg"
            onClick={() => setOpenAtaModal(true)}
            disabled={!connected}
          >
            <Tooltip
              content={!connected && 'You need to be connected to your wallet'}
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
                  <XCircleIcon className="h-5 mr-2 w-5" />
                  Cancel
                </>
              ) : (
                <>
                  <PlusCircleIcon className="h-5 mr-2 w-5" />
                  New Investment
                </>
              )}
            </LinkButton>
          </div>
          {showStrategies ? (
            eligibleInvestments.length > 0 ? (
              eligibleInvestments.map((strat, i) => (
                <StrategyCard
                  key={strat.handledTokenSymbol + i}
                  currentMangoDeposits={currentMangoDeposits}
                  onClick={() => setProposedInvestment(strat)}
                  strat={strat}
                />
              ))
            ) : (
              <div className="border border-fgd-4 p-4 rounded-md">
                <p className="text-center text-fgd-3">
                  No investments available for this account
                </p>
              </div>
            )
          ) : accountInvestments.length > 0 ? (
            accountInvestments.map((strat, i) => (
              <StrategyCard
                key={strat.handledTokenSymbol + i}
                strat={strat}
                currentMangoDeposits={currentMangoDeposits}
              />
            ))
          ) : (
            <div className="border border-fgd-4 p-4 rounded-md">
              <p className="text-center text-fgd-3">
                No investments for this account
              </p>
            </div>
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
              className="border border-fgd-4 default-transition flex items-center justify-between rounded-md hover:bg-bkg-3 hover:border-primary-light p-4 text-sm text-th-fgd-1 mb-2"
              key={activity.signature}
            >
              <div>{activity.signature.substring(0, 12)}...</div>
              <div className="flex items-center">
                <div className="text-fgd-3 text-sm">
                  {activity.blockTime
                    ? fmtUnixTime(new BN(activity.blockTime))
                    : null}
                </div>
                <ExternalLinkIcon className="h-4 ml-2 w-4 text-primary-light" />
              </div>
            </a>
          ))
        ) : (
          <div className="border border-fgd-4 p-4 rounded-md">
            <p className="text-center text-fgd-3">No recent activity</p>
          </div>
        )}
      </div>
      {proposedInvestment && (
        <DepositModal
          governedTokenAccount={currentAccount}
          mangoAccounts={mngoAccounts}
          currentPosition={currentMangoDeposits}
          apy={proposedInvestment.apy}
          handledMint={proposedInvestment.handledMint}
          onClose={() => {
            setProposedInvestment(null)
          }}
          isOpen={proposedInvestment}
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
      {openAtaModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenAtaModal(false)
          }}
          isOpen={openAtaModal}
        >
          <ConvertToMsol />
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
  currentMangoDeposits: number
}

const StrategyCard = ({
  onClick,
  strat,
  currentMangoDeposits,
}: StrategyCardProps) => {
  const {
    handledTokenImgSrc,
    strategyName,
    protocolName,
    handledTokenSymbol,
    apy,
  } = strat
  const currentPositionFtm = new BigNumber(
    currentMangoDeposits.toFixed(0)
  ).toFormat()
  return (
    <div className="border border-fgd-4 flex items-center justify-between mt-2 p-4 rounded-md">
      <div className="flex items-center">
        {handledTokenImgSrc ? (
          <img
            src={strat.handledTokenImgSrc}
            className="h-8 mr-3 rounded-full w-8"
          ></img>
        ) : null}
        <div>
          <p className="text-xs">{`${strategyName} ${handledTokenSymbol} on ${protocolName}`}</p>
          <p className="font-bold text-fgd-1">{`${currentPositionFtm} ${handledTokenSymbol}`}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-xs">Interest Rate</p>
          <p className="font-bold text-green">{apy}</p>
        </div>
        {onClick ? (
          <Button onClick={onClick}>{`Propose ${strategyName}`}</Button>
        ) : null}
      </div>
    </div>
  )
}

export default AccountOverview
