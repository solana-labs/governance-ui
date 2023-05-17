import AccountsItems from './AccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import useRealm from '@hooks/useRealm'
import React from 'react'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Link from 'next/link'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import Loading from '@components/Loading'

const AccountsCompactWrapper = () => {
  const {
    governedTokenAccountsWithoutNfts,
    auxiliaryTokenAccounts,
  } = useGovernanceAssets()
  const accounts = [
    ...governedTokenAccountsWithoutNfts,
    ...auxiliaryTokenAccounts,
  ]
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const isLoadingAccounts = useGovernanceAssetsStore((s) => s.loadTokenAccounts)

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <div className="flex items-center justify-between pb-4">
        <h3 className="mb-0">DAO Wallets &amp; Assets</h3>
        <Link href={fmtUrlWithCluster(`/dao/${symbol}/treasury/v2`)}>
          <a
            className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3`}
          >
            View
            <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
          </a>
        </Link>
      </div>
      <HoldTokensTotalPrice />
      {accounts.length ? (
        <div style={{ maxHeight: '350px' }} className="overflow-y-auto">
          <AccountsItems />
        </div>
      ) : !isLoadingAccounts ? null : (
        <Loading></Loading>
      )}
    </div>
  )
}

export default AccountsCompactWrapper
