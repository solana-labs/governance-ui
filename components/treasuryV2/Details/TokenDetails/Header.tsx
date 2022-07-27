import React, { useState } from 'react'
import cx from 'classnames'
import { DocumentDuplicateIcon, ReplyIcon } from '@heroicons/react/outline'

import { abbreviateAddress } from '@utils/formatting'
import { AssetType, Token, Sol } from '@models/treasury/Asset'
import { formatNumber } from '@utils/formatNumber'
import { SecondaryButton } from '@components/Button'
import Modal from '@components/Modal'
import SendTokens from '@components/TreasuryAccount/SendTokens'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'

interface Props {
  className?: string
  asset: Token | Sol
  isAuxiliary?: boolean
}

export default function Header(props: Props) {
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const setCurrentAccount = useTreasuryAccountStore((s) => s.setCurrentAccount)
  const connection = useWalletStore((s) => s.connection)
  const { canUseTransferInstruction } = useGovernanceAssets()

  return (
    <div
      className={cx(
        props.className,
        'bg-black',
        'min-h-[128px]',
        'px-8',
        'py-4',
        'gap-x-4',
        'grid',
        'grid-cols-[1fr_max-content]',
        'items-center'
      )}
    >
      <div className="overflow-hidden">
        <div className="grid items-center grid-cols-[40px_1fr] gap-x-2">
          {props.asset.type === AssetType.Sol ? (
            <img
              className="h-10 w-10 rounded"
              src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
            />
          ) : (
            React.cloneElement(props.asset.icon, {
              className: cx(
                props.asset.icon.props.classname,
                'h-10',
                'stroke-fgd-1',
                'w-10'
              ),
            })
          )}
          <div className="overflow-hidden">
            <div
              className={cx(
                'overflow-hidden',
                'text-ellipsis',
                'text-sm',
                'text-white/50',
                'whitespace-nowrap'
              )}
            >
              {props.asset.type === AssetType.Sol ? 'SOL' : props.asset.name}
            </div>
            <div
              className={cx(
                'align-baseline',
                'font-bold',
                'overflow-hidden',
                'text-2xl',
                'text-ellipsis',
                'text-fgd-1',
                'whitespace-nowrap'
              )}
              title={
                formatNumber(props.asset.count) +
                ' ' +
                (props.asset.type === AssetType.Sol
                  ? 'SOL'
                  : props.asset.symbol)
              }
            >
              {formatNumber(props.asset.count)}
              <span className="text-sm ml-1">
                {props.asset.type === AssetType.Sol
                  ? 'SOL'
                  : props.asset.symbol}
              </span>
            </div>
          </div>
        </div>
        <button
          className={cx(
            'cursor-pointer',
            'flex',
            'items-center',
            'ml-12',
            'space-x-2',
            'text-white/50',
            'text-xs',
            'transition-colors',
            'hover:text-fgd-1'
          )}
          onClick={async () => {
            try {
              await navigator?.clipboard?.writeText(props.asset.address)
            } catch {
              console.error('Could not copy address to clipboard')
            }
          }}
        >
          <div>{abbreviateAddress(props.asset.address)}</div>
          <DocumentDuplicateIcon className="h-4 w-4" />
        </button>
      </div>
      {!props.isAuxiliary && (
        <SecondaryButton
          className="w-48"
          disabled={!canUseTransferInstruction}
          tooltipMessage={
            !canUseTransferInstruction
              ? 'You need to have connected wallet with ability to create token transfer proposals'
              : undefined
          }
          onClick={() => {
            setCurrentAccount(props.asset.raw, connection)
            setSendModalOpen(true)
          }}
        >
          <div className="flex items-center justify-center">
            <ReplyIcon className="h-4 w-4 mr-1 scale-x-[-1]" />
            Send
          </div>
        </SecondaryButton>
      )}
      {sendModalOpen && (
        <Modal
          isOpen
          sizeClassName="sm:max-w-3xl"
          onClose={() => setSendModalOpen(false)}
        >
          <SendTokens />
        </Modal>
      )}
    </div>
  )
}
