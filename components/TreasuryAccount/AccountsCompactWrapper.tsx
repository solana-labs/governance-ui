import AccountsItems from './AccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import useGovernances from '@hooks/useGovernances'
import { ViewState } from './Types'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useRealm from '@hooks/useRealm'
import { useEffect } from 'react'
import AccountOverview from './AccountOverview'
import SendTokens from './SendTokens'

const AccountsCompactWrapper = () => {
  const { governedTokenAccounts } = useGovernances()
  const currentView = useTreasuryAccountStore((s) => s.compact.currentView)
  const { resetCompactViewState } = useTreasuryAccountStore()
  const { symbol } = useRealm()
  const returnCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4">Treasury</h3>
            <HoldTokensTotalPrice />
            <div className="max-h-full overflow-y-auto">
              <AccountsItems />
            </div>
          </>
        )
      case ViewState.AccountView:
        return <AccountOverview></AccountOverview>
      case ViewState.Send:
        return <SendTokens></SendTokens>
    }
  }
  useEffect(() => {
    resetCompactViewState()
  }, [symbol])
  return governedTokenAccounts.length ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg mt-5">
      {returnCurrentView()}
    </div>
  ) : null
}

export default AccountsCompactWrapper
