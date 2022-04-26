import AccountsItems from './AccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import useRealm from '@hooks/useRealm'
import React from 'react'
import { ChevronRightIcon } from '@heroicons/react/solid'
import { CurrencyDollarIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Link from 'next/link'
import { useRouter } from 'next/router'
import EmptyState from '@components/EmptyState'
import { NEW_TREASURY_ROUTE } from 'pages/dao/[symbol]/treasury'
import useWalletStore from 'stores/useWalletStore'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import Loading from '@components/Loading'

const AccountsCompactWrapper = () => {
  const { governedTokenAccountsWithoutNfts, auxiliaryTokenAccounts } =
    useGovernanceAssets()
  const accounts = [
    ...governedTokenAccountsWithoutNfts,
    ...auxiliaryTokenAccounts,
  ]
  const {
    ownVoterWeight,
    symbol,
    realm,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const connected = useWalletStore((s) => s.connected)
  const isLoadingAccounts = useGovernanceAssetsStore(
    (s) => s.loadGovernedAccounts
  )

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

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <div className="flex items-center justify-between pb-4">
        <h3 className="mb-0">Treasury</h3>
        {accounts.length ? (
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/treasury`)}>
            <a
              className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3`}
            >
              View
              <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
            </a>
          </Link>
        ) : null}
      </div>
      <HoldTokensTotalPrice />
      {accounts.length ? (
        <div style={{ maxHeight: '350px' }} className="overflow-y-auto">
          <AccountsItems />
        </div>
      ) : !isLoadingAccounts ? (
        <EmptyState
          desc="No treasury accounts found"
          disableButton={!isConnectedWithGovernanceCreationPermission}
          buttonText="New Treasury Account"
          icon={<CurrencyDollarIcon />}
          onClickButton={goToNewAccountForm}
        />
      ) : (
        <Loading></Loading>
      )}
    </div>
  )
}

export default AccountsCompactWrapper
