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

const AccountsCompactWrapper = () => {
  const router = useRouter()
  const currentView = useTreasuryAccountStore((s) => s.compact.currentView)
  const { resetCompactViewState } = useTreasuryAccountStore()
  const connected = useWalletStore((s) => s.connected)
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const goToNewAccountForm = () => {
    router.push(fmtUrlWithCluster(`/treasury/new`))
  }
  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4">Treasury</h3>
            <HoldTokensTotalPrice />
            <div className="max-h-full overflow-y-auto">
              <AccountsItems />
              <Tooltip
                content={
                  !connected && 'Connect your wallet to create new account'
                }
              >
                <div
                  onClick={goToNewAccountForm}
                  className={`bg-bkg-2 p-3 default-transition flex flex-col items-center justify-center rounded-lg hover:bg-bkg-3 mt-3 ${
                    !connected
                      ? 'cursor-not-allowed pointer-events-none opacity-60'
                      : 'cursor-pointer'
                  }`}
                >
                  <div className="bg-[rgba(255,255,255,0.06)] h-8 w-8 flex font-bold items-center justify-center rounded-full text-fgd-3">
                    <PlusIcon />
                  </div>
                </div>
              </Tooltip>
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
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg mt-5">
      {getCurrentView()}
    </div>
  )
}

export default AccountsCompactWrapper
