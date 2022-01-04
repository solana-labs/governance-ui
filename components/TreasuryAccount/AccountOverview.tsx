import Button from '@components/Button'
import { getExplorerUrl } from '@components/explorer/tools'
import {
  DEFAULT_NFT_TREASURY_MINT,
  getAccountName,
} from '@components/instructions/tools'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress, fmtUnixTime } from '@utils/formatting'
import BN from 'bn.js'
import { useRouter } from 'next/router'
import React from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import AccountHeader from './AccountHeader'
import { ViewState } from './Types'

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

  const {
    setCurrentCompactView,
    resetCompactViewState,
  } = useTreasuryAccountStore()
  const accountPublicKey = currentAccount
    ? currentAccount.governance?.info.governedAccount
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
        </>
      </h3>
      <AccountHeader></AccountHeader>
      {isNFT && (
        <Button
          className="sm:w-full text-sm py-2.5 mb-4"
          onClick={() => {
            const url = fmtUrlWithCluster(
              `/dao/${symbol}/gallery/${currentAccount.governance?.pubkey.toBase58()}`
            )
            router.push(url)
          }}
        >
          Gallery
        </Button>
      )}
      <div
        className={`flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4 ${
          !canUseTransferInstruction ? 'justify-center' : ''
        }`}
      >
        <Button
          className="sm:w-1/2 text-sm"
          onClick={() =>
            setCurrentCompactView(
              isNFT ? ViewState.DepositNFT : ViewState.Deposit
            )
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
          onClick={() => setCurrentCompactView(ViewState.Send)}
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
    </>
  )
}

export default AccountOverview
