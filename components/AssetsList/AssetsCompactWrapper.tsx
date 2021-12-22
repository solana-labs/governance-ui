import React, { useEffect } from 'react'
import useAssetsStore from 'stores/useAssetsStore'
import { ViewState } from './types'
import MembersItems from './AssetsList'
import { PlusIcon } from '@heroicons/react/outline'
import Tooltip from '@components/Tooltip'
import useRealm from '@hooks/useRealm'
import AssetOverview from './AssetOverview'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
const NEW_PROGRAM_VIEW = `/program/new`

const AssetsCompactWrapper = () => {
  const router = useRouter()
  const { symbol } = useRealm()
  const { resetCompactViewState } = useAssetsStore()
  const currentView = useAssetsStore((s) => s.compact.currentView)
  const { fmtUrlWithCluster } = useQueryContext()
  const goToNewAssetForm = () => {
    router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_PROGRAM_VIEW}`))
  }
  useEffect(() => {
    resetCompactViewState()
  }, [symbol])
  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4 flex items-center">
              Assets
              <Tooltip contentClassName="ml-auto" content={''}>
                <div
                  onClick={goToNewAssetForm}
                  className={`bg-bkg-2 default-transition 
                flex flex-col items-center justify-center
                rounded-lg hover:bg-bkg-3 ml-auto 
                hover:cursor-pointer`}
                >
                  <div
                    className="bg-[rgba(255,255,255,0.06)] h-6 w-6 flex 
                font-bold items-center justify-center 
                rounded-full text-fgd-3"
                  >
                    <PlusIcon />
                  </div>
                </div>
              </Tooltip>
            </h3>
            <div style={{ maxHeight: '350px' }}>
              <MembersItems></MembersItems>
            </div>
          </>
        )
      case ViewState.AssetOverview:
        return <AssetOverview></AssetOverview>
      case ViewState.AddAsset:
        return null
    }
  }
  useEffect(() => {
    resetCompactViewState()
  }, [symbol])
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">{getCurrentView()}</div>
  )
}

export default AssetsCompactWrapper
