import AccountsItems from './AccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import { ViewState } from './Types'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useRealm from '@hooks/useRealm'
import React, { useEffect } from 'react'
import AccountOverview from './AccountOverview'
import SendTokens from './SendTokens'
import DepositTokens from './DepositTokens'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import Tooltip from '@components/Tooltip'
import useWalletStore from 'stores/useWalletStore'

const AccountsCompactWrapper = () => {
  const currentView = useTreasuryAccountStore((s) => s.compact.currentView)
  const { resetCompactViewState } = useTreasuryAccountStore()
  const connected = useWalletStore((s) => s.connected)
  console.log(connected)
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4">Treasury</h3>
            <HoldTokensTotalPrice />
            <div className="max-h-full overflow-y-auto">
              <AccountsItems />
              <Link href={fmtUrlWithCluster(`/treasury/new`)}>
                <Tooltip
                  content={
                    !connected &&
                    'Please connect your wallet to create new account'
                  }
                >
                  <div className="bg-bkg-2 p-3 cursor-pointer default-transition flex flex-col items-center justify-center rounded-lg hover:bg-bkg-3 mt-3">
                    <div className="bg-[rgba(255,255,255,0.06)] h-8 w-8 flex font-bold items-center justify-center rounded-full text-fgd-3">
                      <PlusIcon />
                    </div>
                  </div>
                </Tooltip>
              </Link>
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
