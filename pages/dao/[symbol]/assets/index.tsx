import React from 'react'
import AssetsList from '@components/AssetsList/AssetsList'
import Tooltip from '@components/Tooltip'
import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { LinkButton } from '@components/Button'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
export const NEW_PROGRAM_VIEW = `/program/new`

const Assets = () => {
  const router = useRouter()
  const realm = useRealmQuery().data?.result
  const {
    symbol,
    ownVoterWeight,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { fmtUrlWithCluster } = useQueryContext()
  const goToNewAssetForm = () => {
    router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_PROGRAM_VIEW}`))
  }
  const canCreateGovernance = realm
    ? ownVoterWeight.canCreateGovernance(realm)
    : null

  const newAssetToolTip = renderAddNewAssetTooltip(
    connected,
    canCreateGovernance,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse
  )

  // const addNewAssetTooltip = !connected
  //   ? 'Connect your wallet to create new asset'
  //   : !canCreateGovernance
  //   ? "You don't have enough governance power to create a new asset"
  //   : toManyCommunityOutstandingProposalsForUser
  //   ? 'You have too many community outstanding proposals. You need to finalize them before creating a new asset.'
  //   : toManyCouncilOutstandingProposalsForUse
  //   ? 'You have too many council outstanding proposals. You need to finalize them before creating a new asset.'
  //   : ''
  return (
    <div className="bg-bkg-2 rounded-lg p-4 md:p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <div className="mb-4">
            <PreviousRouteBtn />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="mb-0">Programs</h1>
            <Tooltip contentClassName="ml-auto" content={newAssetToolTip}>
              <LinkButton
                onClick={goToNewAssetForm}
                className={`flex items-center text-primary-light ${
                  newAssetToolTip
                    ? 'cursor-not-allowed pointer-events-none opacity-60'
                    : 'cursor-pointer'
                }`}
              >
                <PlusCircleIcon className="h-5 mr-2 w-5" />
                New Program
              </LinkButton>
            </Tooltip>
          </div>
          <AssetsList />
        </div>
      </div>
    </div>
  )
}

export default Assets

export const renderAddNewAssetTooltip = (
  connected,
  canCreateGovernance,
  toManyCommunityOutstandingProposalsForUser,
  toManyCouncilOutstandingProposalsForUse
) => {
  return !connected
    ? 'Connect your wallet to create new asset'
    : !canCreateGovernance
    ? "You don't have enough governance power to create a new asset"
    : toManyCommunityOutstandingProposalsForUser
    ? 'You have too many community outstanding proposals. You need to finalize them before creating a new asset.'
    : toManyCouncilOutstandingProposalsForUse
    ? 'You have too many council outstanding proposals. You need to finalize them before creating a new asset.'
    : ''
}
