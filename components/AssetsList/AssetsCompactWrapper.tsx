import React, { useEffect } from 'react'
import useAssetsStore from 'stores/useAssetsStore'
import { ViewState } from './types'
import MembersItems from './AssetsList'
import { PlusIcon } from '@heroicons/react/outline'
import Tooltip from '@components/Tooltip'
import useRealm from '@hooks/useRealm'

const AssetsCompactWrapper = () => {
  const { symbol } = useRealm()
  const { setCurrentCompactView, resetCompactViewState } = useAssetsStore()
  const currentView = useAssetsStore((s) => s.compact.currentView)
  const goToAddAssetView = () => {
    setCurrentCompactView(ViewState.AddAsset)
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
                  onClick={goToAddAssetView}
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
            <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
              <p className="text-fgd-3 text-xs">placeholder</p>
              <h3 className="mb-0">placeholder</h3>
            </div>
            <div style={{ maxHeight: '350px' }}>
              <MembersItems></MembersItems>
            </div>
          </>
        )
      case ViewState.AssetOverview:
        return null
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
