import Button from '@components/Button'
import { getExplorerUrl } from '@components/explorer/tools'
import { getProgramName } from '@components/instructions/programs/names'
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/solid'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getProgramSlot } from '@models/registry/api'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import React, { useEffect, useState } from 'react'
import useAssetsStore from 'stores/useAssetsStore'
import useWalletStore from 'stores/useWalletStore'
import { ViewState } from './types'

const AssetOverview = () => {
  const currentAsset = useAssetsStore((s) => s.compact.currentAsset)
  const { canUseProgramUpgradeInstruction } = useGovernanceAssets()
  const [slot, setSlot] = useState(0)
  const connection = useWalletStore((s) => s.connection)
  const { setCurrentCompactView, resetCompactViewState } = useAssetsStore()
  const name = currentAsset
    ? getProgramName(currentAsset.info.governedAccount)
    : ''
  const governedAccount = currentAsset
    ? abbreviateAddress(currentAsset?.info.governedAccount as PublicKey)
    : ''
  const programId = currentAsset!.info.governedAccount.toBase58()
  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  useEffect(() => {
    const handleSetProgramVersion = async () => {
      const slot = await getProgramSlot(
        connection.current,
        programId,
        connection.endpoint
      )
      setSlot(slot)
    }
    handleSetProgramVersion()
  }, [JSON.stringify(currentAsset)])
  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          <ArrowLeftIcon
            onClick={handleGoBackToMainView}
            className="h-4 w-4 mr-1 text-primary-light mr-2 hover:cursor-pointer"
          />
          <div className="text-xs text-th-fgd-1">
            {name ? name : governedAccount}
          </div>
        </>
      </h3>
      <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex mb-4">
        <div>
          Program
          <div className="text-fgd-3 text-xs flex flex-col">
            {currentAsset?.info.governedAccount.toBase58()}
          </div>
        </div>
        <div className="ml-auto">
          <a
            href={
              currentAsset
                ? getExplorerUrl(
                    connection.endpoint,
                    currentAsset?.info.governedAccount.toBase58()
                  )
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
          </a>
        </div>
      </div>
      <div
        className={`flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4 justify-center`}
      >
        {canUseProgramUpgradeInstruction && (
          <Button
            className="sm:w-1/2 text-sm"
            onClick={() => setCurrentCompactView(ViewState.Upgrade)}
          >
            Upgrade
          </Button>
        )}
      </div>
      <div className="font-normal mr-1 text-xs text-fgd-3 mb-4">
        Last deployed slot: <span className="text-fgd-1">{slot}</span>
      </div>
      <div></div>
    </>
  )
}

export default AssetOverview
