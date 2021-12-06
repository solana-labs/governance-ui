import AccountsItems from './AccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import { ViewState } from './Types'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useRealm from '@hooks/useRealm'
import React, { useEffect } from 'react'
import AccountOverview from './AccountOverview'
import SendTokens from './SendTokens'
import DepositTokens from './DepositTokens'
import { PlusIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import useWalletStore from 'stores/useWalletStore'
import { useRouter } from 'next/router'
import Tooltip from '@components/Tooltip'
const NEW_TREASURY_ROUTE = `/treasury/new`

const AccountsCompactWrapper = () => {
  const router = useRouter()
  const currentView = useTreasuryAccountStore((s) => s.compact.currentView)
  const { resetCompactViewState } = useTreasuryAccountStore()
  const connected = useWalletStore((s) => s.connected)
  const { fmtUrlWithCluster } = useQueryContext()
  const { ownVoterWeight, symbol, realm } = useRealm()
  const goToNewAccountForm = () => {
    router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_TREASURY_ROUTE}`))
  }
  const isNewAccountRoute = router.route.includes(NEW_TREASURY_ROUTE)
  const canCreateGovernance = realm
    ? ownVoterWeight.canCreateGovernance(realm)
    : null
  const isConnectedWithGovernanceCreationPermission =
    connected && canCreateGovernance
  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4 flex items-center">
              Treasury
              {!isNewAccountRoute && (
                <Tooltip
                  contentClassName="ml-auto"
                  content={
                    !connected
                      ? 'Connect your wallet to create new account'
                      : !canCreateGovernance
                      ? "You don't have enough governance power to create a new treasury account"
                      : ''
                  }
                >
                  <div
                    onClick={goToNewAccountForm}
                    className={`bg-bkg-2 default-transition flex flex-col items-center justify-center rounded-lg hover:bg-bkg-3 ml-auto ${
                      !isConnectedWithGovernanceCreationPermission
                        ? 'cursor-not-allowed pointer-events-none opacity-60'
                        : 'cursor-pointer'
                    }`}
                  >
                    <div className="bg-[rgba(255,255,255,0.06)] h-6 w-6 flex font-bold items-center justify-center rounded-full text-fgd-3">
                      <PlusIcon />
                    </div>
                  </div>
                </Tooltip>
              )}
            </h3>
            <HoldTokensTotalPrice />
            <div style={{ maxHeight: '505px' }} className="overflow-y-auto">
              <AccountsItems />
            </div>
          </>
        )
      case ViewState.AccountView:
        return <AccountOverview></AccountOverview>
      case ViewState.Send:
        return <SendTokens></SendTokens>
      case ViewState.Deposit:
        return <DepositTokens></DepositTokens>
    }
  }

  useEffect(() => {
    resetCompactViewState()
  }, [symbol])
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">{getCurrentView()}</div>
  )
}

export default AccountsCompactWrapper
