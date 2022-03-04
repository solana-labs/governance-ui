import Button, { SecondaryButton } from '@components/Button'
import { getExplorerUrl } from '@components/explorer/tools'
import { getProgramName } from '@components/instructions/programs/names'
import Modal from '@components/Modal'
import Tooltip from '@components/Tooltip'
import { CogIcon } from '@heroicons/react/outline'
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/solid'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import UpgradeProgram from './UpgradeProgram'
import { PublicKey } from '@solana/web3.js'
import { getProgramSlot } from '@tools/sdk/bpfUpgradeableLoader/accounts'
import { abbreviateAddress } from '@utils/formatting'
import React, { useEffect, useState } from 'react'
import useAssetsStore from 'stores/useAssetsStore'
import useWalletStore from 'stores/useWalletStore'
import { ViewState } from './types'
import CloseBuffers from './CloseBuffers'

const AssetOverview = () => {
  const currentAsset = useAssetsStore((s) => s.compact.currentAsset)
  const { canUseProgramUpgradeInstruction } = useGovernanceAssets()
  const [slot, setSlot] = useState(0)
  const connection = useWalletStore((s) => s.connection)
  const { setCurrentCompactView, resetCompactViewState } = useAssetsStore()
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false)
  const [openCloseBuffersModal, setOpenCloseBuffersModal] = useState(false)
  const name = currentAsset
    ? getProgramName(currentAsset.account.governedAccount)
    : ''
  const governedAccount = currentAsset
    ? abbreviateAddress(currentAsset?.account.governedAccount as PublicKey)
    : ''
  const programId = currentAsset!.account.governedAccount.toBase58()
  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  useEffect(() => {
    const handleSetProgramVersion = async () => {
      const slot = await getProgramSlot(connection.current, programId)
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
          <a
            href={
              currentAsset
                ? getExplorerUrl(
                    connection.endpoint,
                    currentAsset?.account.governedAccount.toBase58()
                  )
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
          </a>
        </>
      </h3>
      <div className="bg-bkg-1 px-4 py-2 w-full break-all flex mb-4 items-center">
        <CogIcon className="h-6 text-fgd-3 w-6 mr-2.5" />
        <div className="mr-1 text-xs text-fgd-3">
          <span className="text-fgd-1">Last deployed slot:</span> {slot}
        </div>
      </div>
      <div
        className={`flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4 justify-center`}
      >
        <Button
          disabled={!canUseProgramUpgradeInstruction}
          className="sm:w-1/2 text-sm"
          onClick={() => setOpenUpgradeModal(true)}
        >
          <Tooltip
            content={
              !canUseProgramUpgradeInstruction &&
              'You need to have connected wallet with ability to create upgrade proposals'
            }
          >
            <div>Upgrade</div>
          </Tooltip>
        </Button>
        <SecondaryButton
          className="sm:w-1/2 text-sm"
          onClick={() => setOpenCloseBuffersModal(true)}
          disabled={!canUseProgramUpgradeInstruction}
        >
          <Tooltip
            content={
              !canUseProgramUpgradeInstruction &&
              'You need to have connected wallet with ability to create upgrade proposals'
            }
          >
            <div>Close Buffers</div>
          </Tooltip>
        </SecondaryButton>
      </div>
      {openUpgradeModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenUpgradeModal(false)
          }}
          isOpen={openUpgradeModal}
        >
          <UpgradeProgram></UpgradeProgram>
        </Modal>
      )}
      {openCloseBuffersModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenCloseBuffersModal(false)
          }}
          isOpen={openCloseBuffersModal}
        >
          <CloseBuffers></CloseBuffers>
        </Modal>
      )}
    </>
  )
}

export default AssetOverview
