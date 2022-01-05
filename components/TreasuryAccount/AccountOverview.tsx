import Button, { SecondaryButton } from '@components/Button'
import { getExplorerUrl } from '@components/explorer/tools'
import {
  DEFAULT_NFT_TREASURY_MINT,
  getAccountName,
} from '@components/instructions/tools'
import Modal from '@components/Modal'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress, fmtUnixTime } from '@utils/formatting'
import BN from 'bn.js'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import AccountHeader from './AccountHeader'
import DepositNFT from './DepositNFT'
import { ViewState } from './Types'
import SendTokens from './SendTokens'

const AccountOverview = () => {
  const router = useRouter()
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const isNFT =
    currentAccount?.mint?.publicKey.toBase58() === DEFAULT_NFT_TREASURY_MINT
  const { canUseTransferInstruction } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const recentActivity = useTreasuryAccountStore(
    (s) => s.compact.recentActivity
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
              {abbreviateAddress(accountPublicKey as PublicKey)}
            </div>
          )}
          {isNFT && (
            <SecondaryButton
              className="ml-auto text-xs"
              onClick={() => {
                const url = fmtUrlWithCluster(
                  `/dao/${symbol}/gallery/${currentAccount.governance?.pubkey.toBase58()}`
                )
                router.push(url)
              }}
            >
              See all
            </SecondaryButton>
          )}
        </>
      </h3>
      <AccountHeader></AccountHeader>
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
          tooltipMessage={
            !canUseTransferInstruction
              ? 'You need to have connected wallet with ability to create token transfer proposals'
              : ''
          }
          className="sm:w-1/2 text-sm py-2.5"
          onClick={() => (!isNFT ? setOpenCommonSendModal(true) : () => null)}
          disabled={!canUseTransferInstruction}
        >
          Send
        </Button>
      </div>
      <div className="font-normal mr-1 text-xs text-fgd-3 mb-4">
        Recent activity
      </div>
      <div>
        {recentActivity.map((activity) => (
          <a
            href={
              activity.signature
                ? getExplorerUrl(connection.endpoint, activity.signature, 'tx')
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            className="border border-fgd-4 default-transition rounded-lg hover:bg-bkg-3 css-1ug690d-StyledCardWrapepr elzt7lo0 p-4 text-xs text-th-fgd-1 mb-2 flex"
            key={activity.signature}
          >
            <div>{activity.signature.substring(0, 12)}...</div>
            <div className="ml-auto text-fgd-3 text-xs flex flex-col">
              {activity.blockTime
                ? fmtUnixTime(new BN(activity.blockTime))
                : null}
            </div>
          </a>
        ))}
      </div>
      {openNftDepositModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenNftDepositModal(false)
          }}
          isOpen={openNftDepositModal}
        >
          <DepositNFT></DepositNFT>
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
          <SendTokens></SendTokens>
        </Modal>
      )}
    </>
  )
}

export default AccountOverview
