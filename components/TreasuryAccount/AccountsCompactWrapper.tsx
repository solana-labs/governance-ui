import AccountsItems from './AccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import { ViewState } from './Types'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useRealm from '@hooks/useRealm'
import React, { useEffect } from 'react'
import AccountOverview from './AccountOverview'
import DepositTokens from './DepositTokens'
import { PlusIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import useWalletStore from 'stores/useWalletStore'
import { useRouter } from 'next/router'
import Tooltip from '@components/Tooltip'
import { ArrowsExpandIcon } from '@heroicons/react/outline'

const NEW_TREASURY_ROUTE = `/treasury/new`

const AccountsCompactWrapper = () => {
  const router = useRouter()
  const currentView = useTreasuryAccountStore((s) => s.compact.currentView)
  const { resetCompactViewState } = useTreasuryAccountStore()
  const connected = useWalletStore((s) => s.connected)
  const { fmtUrlWithCluster } = useQueryContext()
  const {
    ownVoterWeight,
    symbol,
    realm,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()
  const goToNewAccountForm = () => {
    router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_TREASURY_ROUTE}`))
  }
  const canCreateGovernance = realm
    ? ownVoterWeight.canCreateGovernance(realm)
    : null
  const isConnectedWithGovernanceCreationPermission =
    connected &&
    canCreateGovernance &&
    !toManyCommunityOutstandingProposalsForUser &&
    !toManyCouncilOutstandingProposalsForUse
  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="bg-bkg-2 mb-4 flex items-center">
              <div
                className="cursor-pointer flex items-center"
                onClick={() => {
                  const url = fmtUrlWithCluster(`/dao/${symbol}/treasury`)
                  router.push(url)
                }}
              >
                Treasury
                <ArrowsExpandIcon className="flex-shrink-0 h-4 w-4 cursor-pointer ml-1 text-primary-light"></ArrowsExpandIcon>
              </div>

              <div className="ml-auto flex items-center">
                <Tooltip
                  content={
                    !connected
                      ? 'Connect your wallet to create new account'
                      : !canCreateGovernance
                      ? "You don't have enough governance power to create a new treasury account"
                      : toManyCommunityOutstandingProposalsForUser
                      ? 'You have too many community outstanding proposals. You need to finalize them before creating a new treasury account.'
                      : toManyCouncilOutstandingProposalsForUse
                      ? 'You have too many council outstanding proposals. You need to finalize them before creating a new treasury account.'
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
              </div>
            </h3>
            <HoldTokensTotalPrice />
            <div style={{ maxHeight: '350px' }} className="overflow-y-auto">
              <AccountsItems />
            </div>
          </>
        )
      case ViewState.AccountView:
        return <AccountOverview></AccountOverview>
      case ViewState.Deposit:
        return <DepositTokens></DepositTokens>
    }
  }

  useEffect(() => {
    resetCompactViewState()
  }, [symbol])
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      {getCurrentView()}
    </div>
  )
}

export default AccountsCompactWrapper
