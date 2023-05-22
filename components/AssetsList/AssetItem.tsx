import { useEffect, useState } from 'react'
import { ExternalLinkIcon, TerminalIcon } from '@heroicons/react/outline'
import { ProgramAccount } from '@solana/spl-governance'
import { Governance } from '@solana/spl-governance'
import { getProgramName } from '@components/instructions/programs/names'
import { abbreviateAddress } from '@utils/formatting'
import { PublicKey } from '@solana/web3.js'
import Button, { SecondaryButton } from '@components/Button'
import Tooltip from '@components/Tooltip'
import { getProgramData } from '@tools/sdk/bpfUpgradeableLoader/accounts'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Modal from '@components/Modal'
import UpgradeProgram from './UpgradeProgram'
import CloseBuffers from './CloseBuffers'
import { getExplorerUrl } from '@components/explorer/tools'
import TransferUpgradeAuthority from './TransferUpgradeAuthority'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const AssetItem = ({
  item,
  panelView,
}: {
  item: ProgramAccount<Governance>
  panelView?: boolean
}) => {
  const { canUseProgramUpgradeInstruction } = useGovernanceAssets()
  const [isAuthority, setIsAuthority] = useState(true)
  const [slot, setSlot] = useState(0)
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false)
  const [openCloseBuffersModal, setOpenCloseBuffersModal] = useState(false)
  const [openTransferAuthorityModal, setOpenTransferAuthorityModal] = useState(
    false
  )
  const [loadData, setLoadData] = useState(false)
  const connection = useLegacyConnectionContext()
  const name = item ? getProgramName(item.account.governedAccount) : ''
  const governedAccount = item
    ? abbreviateAddress(item?.account.governedAccount as PublicKey)
    : ''
  const programId = item!.account.governedAccount.toBase58()

  useEffect(() => {
    const handleSetProgramVersion = async () => {
      try {
        setLoadData(true)
        const programData = await getProgramData(connection.current, programId)
        const isAuthority =
          item.pubkey.toString() === programData?.authority?.toString()
        setIsAuthority(isAuthority)
        setSlot(programData.slot)
      } catch (e) {
        console.log(e)
      }
      setLoadData(false)
    }
    if (!panelView) {
      handleSetProgramVersion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(item), panelView])

  return (
    <div className="text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full">
      <div className="flex items-center">
        <TerminalIcon className="h-6 mr-2 text-fgd-3 w-6" />
        <div>
          <h3
            className={`mb-0 text-fgd-1 ${panelView && 'font-normal text-xs'}`}
          >
            {name || 'Program'}
          </h3>
          <a
            className="default-transition flex items-center mt-0.5 text-fgd-3 hover:text-fgd-2 text-xs"
            href={getExplorerUrl(
              connection.cluster,
              item?.account.governedAccount
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {governedAccount}
            <ExternalLinkIcon className="flex-shrink-0 h-3.5 ml-1 text-primary-light w-3.5" />
          </a>
        </div>
      </div>
      {!panelView && loadData && (
        <div className="animate-pulse bg-bkg-3 h-5 ml-1 rounded w-16" />
      )}
      {!panelView && !loadData && (
        <>
          <div className="bg-bkg-1 mt-4 px-4 py-3 rounded-md w-full break-all flex mb-6 items-center">
            <div className="flex items-center text-sm text-fgd-3">
              Last deployed slot:{' '}
              <span className="font-bold ml-1 text-fgd-1">{slot}</span>
            </div>
          </div>
          <div
            className={`flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4 justify-center`}
          >
            {' '}
            {isAuthority ? (
              <>
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
                <SecondaryButton
                  className="sm:w-1/2 text-sm"
                  onClick={() => setOpenTransferAuthorityModal(true)}
                  disabled={!canUseProgramUpgradeInstruction}
                >
                  <Tooltip
                    content={
                      !canUseProgramUpgradeInstruction &&
                      'You need to have connected wallet with ability to create upgrade proposals'
                    }
                  >
                    <div>Transfer Authority</div>
                  </Tooltip>
                </SecondaryButton>
              </>
            ) : (
              <div className="flex items-center text-sm text-fgd-3">
                This governance is no longer the upgrade authority
              </div>
            )}
          </div>
        </>
      )}
      {isAuthority && openUpgradeModal && (
        <Modal
          onClose={() => {
            setOpenUpgradeModal(false)
          }}
          isOpen={openUpgradeModal}
        >
          <UpgradeProgram program={item} />
        </Modal>
      )}
      {isAuthority && openCloseBuffersModal && (
        <Modal
          onClose={() => {
            setOpenCloseBuffersModal(false)
          }}
          isOpen={openCloseBuffersModal}
        >
          <CloseBuffers program={item} />
        </Modal>
      )}
      {isAuthority && openTransferAuthorityModal && (
        <Modal
          onClose={() => {
            setOpenTransferAuthorityModal(false)
          }}
          isOpen={openTransferAuthorityModal}
        >
          <TransferUpgradeAuthority program={item} />
        </Modal>
      )}
    </div>
  )
}

export default AssetItem
