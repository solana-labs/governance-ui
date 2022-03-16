import AccountsItems from './AccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import useRealm from '@hooks/useRealm'
import React from 'react'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import { LinkButton } from '@components/Button'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

const AccountsCompactWrapper = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol } = useRealm()
  const { governedTokenAccounts } = useGovernanceAssets()

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <>
        <div className="flex items-center justify-between pb-4">
          <h3 className="mb-0">Treasury</h3>
          <LinkButton
            className={`flex items-center text-primary-light`}
            onClick={() => {
              const url = fmtUrlWithCluster(`/dao/${symbol}/treasury`)
              router.push(url)
            }}
          >
            View
            <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
          </LinkButton>
        </div>
        <HoldTokensTotalPrice />
        <div style={{ maxHeight: '350px' }} className="overflow-y-auto">
          {governedTokenAccounts.length && <AccountsItems />}
        </div>
      </>
    </div>
  )
}

export default AccountsCompactWrapper
