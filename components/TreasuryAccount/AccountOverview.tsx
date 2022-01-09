import Button from '@components/Button'
import { getExplorerUrl } from '@components/explorer/tools'
import { getAccountName } from '@components/instructions/tools'
import Loading from '@components/Loading'
import Modal from '@components/Modal'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress, fmtUnixTime } from '@utils/formatting'
import BN from 'bn.js'
import React, { useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import AccountLabel from './AccountHeader'
import { useRouter } from 'next/router'
import DepositNFT from './DepositNFT'
import { ViewState } from './Types'
import SendTokens from './SendTokens'
import { ExternalLinkIcon, ArrowsExpandIcon } from '@heroicons/react/outline'
import AccountHeader from './AccountHeader'

const AccountOverview = () => {
  const router = useRouter()
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const connected = useWalletStore((s) => s.connected)

  const nftsCount =
    currentAccount?.governance && currentAccount.isNft
      ? useTreasuryAccountStore((s) => s.governanceNfts)[
          currentAccount?.governance?.pubkey.toBase58()
        ]?.length
      : 0
  const {
    symbol,
    toManyCouncilOutstandingProposalsForUse,
    toManyCommunityOutstandingProposalsForUser,
  } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const isNFT = currentAccount?.isNft
  const { canUseTransferInstruction } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const recentActivity = useTreasuryAccountStore(
    (s) => s.compact.recentActivity
  )
  const [openTreasuryPaymentModal, setOpenTreasuryPaymentModal] = useState(
    false
  )

  const [openNftDepositModal, setOpenNftDepositModal] = useState(false)
  const [openCommonSendModal, setOpenCommonSendModal] = useState(false)
  const {
    setCurrentCompactView,
    resetCompactViewState,
  } = useTreasuryAccountStore()
  //for nfts for now we use governance pubkey
  const accountPublicKey = currentAccount
    ? isNFT
      ? currentAccount.governance?.pubkey
      : currentAccount.governance?.info.governedAccount
    : null

  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }

  const sendTooltip = !connected
    ? 'Connect your wallet to make a treasury payment'
    : !canUseTransferInstruction
    ? "You don't have enough governance power to transfer tokens"
    : toManyCommunityOutstandingProposalsForUser ||
      toManyCouncilOutstandingProposalsForUse
    ? 'You have too many outstanding proposals. You need to finalize them before making a new treasury payment.'
    : isNFT && nftsCount === 0
    ? 'You need to deposit nfts first'
    : ''

  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          <ArrowLeftIcon
            onClick={handleGoBackToMainView}
            className="h-4 w-4 text-primary-light mr-2 hover:cursor-pointer"
          />
          {currentAccount?.token?.publicKey &&
          getAccountName(currentAccount?.token?.publicKey) ? (
            <div className="text-sm text-th-fgd-1">
              {getAccountName(currentAccount.token?.publicKey)}
            </div>
          ) : (
            <div className="text-xs text-th-fgd-1">
              {accountPublicKey &&
                abbreviateAddress(accountPublicKey as PublicKey)}
            </div>
          )}
          <a
            href={
              accountPublicKey
                ? getExplorerUrl(connection.endpoint, accountPublicKey)
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
          </a>
          <div className="ml-auto flex flex-row">
            {isNFT && (
              <ArrowsExpandIcon
                className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4 cursor-pointer"
                onClick={() => {
                  const url = fmtUrlWithCluster(
                    `/dao/${symbol}/gallery/${currentAccount.governance?.pubkey.toBase58()}`
                  )
                  router.push(url)
                }}
              ></ArrowsExpandIcon>
            )}
          </div>
        </>
      </h3>

      <AccountHeader />

      <div
        className={`flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4 ${
          !canUseTransferInstruction || isNFT ? 'justify-center' : ''
        }`}
      >
        <Button
          className="sm:w-1/2 text-sm"
          onClick={() =>
            isNFT
              ? setOpenNftDepositModal(true)
              : setCurrentCompactView(ViewState.Deposit)
          }
        >
          Deposit
        </Button>

        <Button
          tooltipMessage={sendTooltip}
          className="sm:w-1/2 text-sm py-2.5"
          onClick={() => setOpenCommonSendModal(true)}
          disabled={!canUseTransferInstruction || (isNFT && nftsCount === 0)}
        >
          Send
        </Button>
      </div>

      <p className="font-normal mr-1 text-xs text-fgd-3 mb-4">
        Recent activity
      </p>

      <div>
        {recentActivity.length > 0 ? (
          recentActivity.map((activity) => (
            <a
              href={
                activity.signature
                  ? getExplorerUrl(
                      connection.endpoint,
                      activity.signature,
                      'tx'
                    )
                  : ''
              }
              target="_blank"
              rel="noopener noreferrer"
              className="border border-fgd-4 default-transition rounded-lg hover:bg-bkg-3 css-1ug690d-StyledCardWrapepr elzt7lo0 p-4 text-xs text-th-fgd-1 mb-2 flex"
              key={activity.signature}
            >
              <p className="text-xs">{activity.signature.substring(0, 8)}...</p>

              <p className="ml-auto text-fgd-3 text-xs flex flex-col">
                {activity.blockTime
                  ? fmtUnixTime(new BN(activity.blockTime))
                  : null}
              </p>
            </a>
          ))
        ) : (
          <div className="mx-auto mt-4">
            <Loading />
          </div>
        )}
      </div>
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
          />
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
          <SendTokens close={() => setOpenCommonSendModal(false)} />
        </Modal>
      )}
    </>
  )
}

export default AccountOverview
