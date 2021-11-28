import AccountsItems from './AccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { ViewState } from './Types'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useRealm from '@hooks/useRealm'
import { useEffect } from 'react'
import AccountOverview from './AccountOverview'
import SendTokens from './SendTokens'
import DepositTokens from './DepositTokens'

const AccountsCompactWrapper = () => {
  const { governedTokenAccounts } = useGovernanceAssets()
  const currentView = useTreasuryAccountStore((s) => s.compact.currentView)
  const { resetCompactViewState } = useTreasuryAccountStore()
  const { symbol } = useRealm()
  const getCurrentView = () => {
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
      case ViewState.Deposit:
        return <DepositTokens></DepositTokens>
    }
  }
  useEffect(() => {
    resetCompactViewState()
  }, [symbol])
  return governedTokenAccounts.length ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg mt-5">
      {getCurrentView()}
    </div>
  ) : null
}

export default AccountsCompactWrapper
