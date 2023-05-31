import React from 'react'
import AssetsList from './AssetsList'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { TerminalIcon } from '@heroicons/react/outline'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import EmptyState from '@components/EmptyState'
import {
  NEW_PROGRAM_VIEW,
  renderAddNewAssetTooltip,
} from 'pages/dao/[symbol]/assets'
import { AccountType } from '@utils/uiTypes/assets'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import Loading from '@components/Loading'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'

const AssetsCompactWrapper = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const realm = useRealmQuery().data?.result
  const {
    symbol,
    ownVoterWeight,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const canCreateGovernance = realm
    ? ownVoterWeight.canCreateGovernance(realm)
    : null

  const newAssetToolTip = renderAddNewAssetTooltip(
    connected,
    canCreateGovernance,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse
  )

  const goToNewAssetForm = () => {
    router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_PROGRAM_VIEW}`))
  }
  const { assetAccounts } = useGovernanceAssets()
  const programGovernances = assetAccounts
    .filter((x) => x.type === AccountType.PROGRAM)
    .map((x) => x.governance)
  const isLoadingGovernances = useGovernanceAssetsStore(
    (s) => s.loadProgramAccounts
  )
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <div className="flex items-center justify-between pb-4">
        <h3 className="mb-0">Programs</h3>
        {programGovernances.length > 0 ? (
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/assets`)}>
            <a
              className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3`}
            >
              View
              <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
            </a>
          </Link>
        ) : null}
      </div>
      {programGovernances.length > 0 ? (
        <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
          <AssetsList panelView />
        </div>
      ) : !isLoadingGovernances ? (
        <EmptyState
          desc="No programs found"
          disableButton={!!newAssetToolTip}
          buttonText="New Program"
          icon={<TerminalIcon />}
          onClickButton={goToNewAssetForm}
          toolTipContent={newAssetToolTip}
        />
      ) : (
        <Loading></Loading>
      )}
    </div>
  )
}

export default AssetsCompactWrapper
