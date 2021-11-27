import TreasuryAccountsItems from './TreasuryAccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import useGovernances from '@hooks/useGovernances'
import { ViewState } from './Types'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'

const TreasuryAccountsCompactWrapper = () => {
  const { governedTokenAccounts } = useGovernances()
  const { currentView } = useTreasuryAccountStore((s) => s)
  function returnCurrentView() {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            {' '}
            <h3 className="mb-4">Treasury</h3>
            <HoldTokensTotalPrice />
            <div className="max-h-full overflow-y-auto">
              <TreasuryAccountsItems />
            </div>
          </>
        )
    }
  }
  return governedTokenAccounts.length ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg mt-5">
      {returnCurrentView()}
    </div>
  ) : null
}

export default TreasuryAccountsCompactWrapper
