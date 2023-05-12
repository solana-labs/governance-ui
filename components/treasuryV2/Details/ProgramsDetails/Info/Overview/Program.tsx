import React, { useState } from 'react'
import cx from 'classnames'
import {
  ChevronDoubleUpIcon,
  DocumentDuplicateIcon,
  DotsHorizontalIcon,
  ExternalLinkIcon,
  StopIcon,
  SwitchHorizontalIcon,
} from '@heroicons/react/outline'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { abbreviateAddress } from '@utils/formatting'
import { getProgramName } from '@components/instructions/programs/names'
import { Program as ProgramModel } from '@models/treasury/Program'
import CloseBuffers from '@components/AssetsList/CloseBuffers'
import Modal from '@components/Modal'
import Tooltip from '@components/Tooltip'
import TransferUpgradeAuthority from '@components/AssetsList/TransferUpgradeAuthority'
import UpgradeProgram from '@components/AssetsList/UpgradeProgram'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

interface Props {
  className?: string
  program: ProgramModel
}

export default function Program(props: Props) {
  const { canUseProgramUpgradeInstruction } = useGovernanceAssets()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const [closeBuffersModalOpen, setOpenCloseBuffersModalOpen] = useState(false)
  const [
    transferAuthorityModalOpen,
    setOpenTransferAuthorityModalOpen,
  ] = useState(false)
  const [upgradeModalOpen, setUpgradeModelOpen] = useState(false)

  const disabled =
    !props.program.walletIsUpgradeAuthority ||
    !connected ||
    !canUseProgramUpgradeInstruction

  return (
    <div
      className={cx(props.className, 'flex', 'items-center', 'justify-between')}
    >
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="text-fgd-1 font-bold text-lg">
            {getProgramName(props.program.address) ||
              abbreviateAddress(props.program.address)}
          </div>
          <a
            href={`https://explorer.solana.com/address/${props.program.address}`}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLinkIcon
              className={cx(
                'h-4',
                'stroke-white/50',
                'transition-all',
                'w-4',
                'hover:stroke-fgd-1'
              )}
            />
          </a>
          <button
            onClick={async () => {
              try {
                await navigator?.clipboard?.writeText(props.program.address)
              } catch {
                console.error('Could not copy address to clipboard')
              }
            }}
          >
            <Tooltip content="Copy Address">
              <DocumentDuplicateIcon
                className={cx(
                  'h-4',
                  'stroke-white/50',
                  'transition-all',
                  'w-4',
                  'hover:stroke-fgd-1'
                )}
              />
            </Tooltip>
          </button>
        </div>
        <a
          className="px-3 py-1 bg-bkg-2 flex items-center space-x-2 rounded"
          href={`https://explorer.solana.com/block/${props.program.lastDeployedSlot}`}
          target="_blank"
          rel="noreferrer"
        >
          <div className="text-sm text-white/50">Last deployed slot:</div>
          <div className="text-sm text-fgd-1 font-bold">
            {props.program.lastDeployedSlot}
          </div>
          <ExternalLinkIcon className="h-4 w-4 stroke-primary-light" />
        </a>
      </div>
      <Tooltip
        content={
          !props.program.walletIsUpgradeAuthority
            ? 'This wallet is not the upgrade authority'
            : !connected
            ? 'You must connect your wallet'
            : !canUseProgramUpgradeInstruction
            ? "You don't have the ability to update this program"
            : ''
        }
      >
        <div className="flex items-center space-x-8">
          <button
            className={cx(
              'flex',
              'items-center',
              'space-x-1',
              'text-primary-light',
              'disabled:text-white/30',
              'disabled:cursor-not-allowed'
            )}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setUpgradeModelOpen(true)
              }
            }}
          >
            <ChevronDoubleUpIcon className="h4 w-4" />
            <div className="text-xs">Upgrade</div>
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              className={cx(
                'p-0',
                'm-0',
                'text-fgd-1',
                'disabled:text-white/30',
                'disabled:cursor-not-allowed'
              )}
              disabled={disabled}
            >
              <DotsHorizontalIcon className="h-6 w-6" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                // @asktree isn't sure, but suspects, that this needs z-20 or something
                className="bg-black py-5 px-4 rounded"
                side="top"
              >
                <DropdownMenu.Item
                  className={cx(
                    'flex',
                    'items-center',
                    'text-white/70',
                    'space-x-1',
                    'transition-colors',
                    'cursor-pointer',
                    'hover:text-white'
                  )}
                  onClick={() => setOpenCloseBuffersModalOpen(true)}
                >
                  <StopIcon className="h-4 w-4" />
                  <div className="text-xs">Close Buffers</div>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className={cx(
                    'flex',
                    'items-center',
                    'text-white/70',
                    'space-x-1',
                    'mt-4',
                    'transition-colors',
                    'cursor-pointer',
                    'hover:text-white'
                  )}
                  onClick={() => setOpenTransferAuthorityModalOpen(true)}
                >
                  <SwitchHorizontalIcon className="h-4 w-4" />
                  <div className="text-xs">Transfer Authority</div>
                </DropdownMenu.Item>
                <DropdownMenu.Arrow className="text-black" />
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </Tooltip>
      {!disabled && closeBuffersModalOpen && (
        <Modal isOpen onClose={() => setOpenCloseBuffersModalOpen(false)}>
          <CloseBuffers program={props.program.raw.governance} />
        </Modal>
      )}
      {!disabled && transferAuthorityModalOpen && (
        <Modal isOpen onClose={() => setOpenTransferAuthorityModalOpen(false)}>
          <TransferUpgradeAuthority program={props.program.raw.governance} />
        </Modal>
      )}
      {!disabled && upgradeModalOpen && (
        <Modal isOpen onClose={() => setUpgradeModelOpen(false)}>
          <UpgradeProgram program={props.program.raw.governance} />
        </Modal>
      )}
    </div>
  )
}
