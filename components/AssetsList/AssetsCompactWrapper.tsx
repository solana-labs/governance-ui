import React from 'react'
import AssetsList from './AssetsList'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'
import Link from 'next/link'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { GovernanceAccountType } from '@solana/spl-governance'

const AssetsCompactWrapper = () => {
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const { getGovernancesByAccountTypes } = useGovernanceAssets()
  const programGovernances = getGovernancesByAccountTypes([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ])

  return programGovernances.length > 0 ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <div className="flex items-center justify-between pb-4">
        <h3 className="mb-0">Assets</h3>
        <Link href={fmtUrlWithCluster(`/dao/${symbol}/assets`)}>
          <a
            className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3`}
          >
            View
            <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
          </a>
        </Link>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
        <AssetsList panelView />
      </div>
    </div>
  ) : null
}

export default AssetsCompactWrapper
