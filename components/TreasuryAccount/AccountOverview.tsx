import Button from '@components/Button'
import { getExplorerUrl } from '@components/explorer/tools'
import { getAccountName } from '@components/instructions/tools'
import Loading from '@components/Loading'
import Modal from '@components/Modal'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress, fmtUnixTime } from '@utils/formatting'
import BN from 'bn.js'
import React, { useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import AccountLabel from './AccountHeader'
import TreasuryPaymentForm from './TreasuryPaymentForm'
import { ViewState } from './Types'

const AccountOverview = () => {
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const { canUseTransferInstruction } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const recentActivity = useTreasuryAccountStore(
    (s) => s.compact.recentActivity
  )
  const [openTreasuryPaymentModal, setOpenTreasuryPaymentModal] = useState(
    false
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
      <h3 className="mb-8 flex items-center">
        <ArrowLeftIcon
          onClick={handleGoBackToMainView}
          className="h-4 w-4 text-primary-light mr-2 hover:cursor-pointer"
        />

        {currentAccount?.token?.publicKey &&
        getAccountName(currentAccount?.token?.publicKey) ? (
          <p className="text-sm text-th-fgd-1">
            {getAccountName(currentAccount.token?.publicKey)}
          </p>
        ) : (
          <p className="text-xs text-th-fgd-1">
            {abbreviateAddress(accountPublicKey as PublicKey)}
          </p>
        )}
      </h3>

      <AccountLabel />

      {openTreasuryPaymentModal && (
        <Modal
          background="bg-bkg-1"
          sizeClassName="sm:max-w-3xl"
          onClose={() => setOpenTreasuryPaymentModal(false)}
          isOpen={openTreasuryPaymentModal}
        >
          <TreasuryPaymentForm
            close={() => setOpenTreasuryPaymentModal(false)}
          />
        </Modal>
      )}

      <div
        className={`flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4 mb-8 ${
          !canUseTransferInstruction ? 'justify-center' : ''
        }`}
      >
        <Button
          className="sm:w-1/2 text-sm"
          onClick={() => setCurrentCompactView(ViewState.Deposit)}
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
          onClick={() => setOpenTreasuryPaymentModal(!openTreasuryPaymentModal)}
          disabled={!canUseTransferInstruction}
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
    </>
  )
}

export default AccountOverview
