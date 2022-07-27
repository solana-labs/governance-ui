import React from 'react'
import cx from 'classnames'
import {
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@heroicons/react/outline'

import { AssetType, Asset } from '@models/treasury/Asset'
import { AuxiliaryWallet } from '@models/treasury/Wallet'
import { formatNumber } from '@utils/formatNumber'

import AssetsPreviewIconList from '../WalletListItem/AssetsPreviewIconList'
import AssetList from '../WalletListItem/AssetList'

interface Props {
  className?: string
  expanded?: boolean
  selected?: boolean
  selectedAsset?: Asset | null
  wallet: AuxiliaryWallet
  onSelectWallet?(): void
  onSelectAsset?(asset: Asset): void
  onExpand?(): void
}

export default function AuxiliaryWalletListItem(props: Props) {
  const containsTokens = props.wallet.assets.some(
    (asset) => asset.type === AssetType.Token || asset.type === AssetType.Sol
  )
  const isOpen = props.expanded || props.selected

  return (
    <div
      className={cx(
        props.className,
        'border-dashed',
        'border-white/30',
        'border',
        'group',
        'overflow-hidden',
        'relative',
        'rounded'
      )}
    >
      <button
        className={cx(
          'h-24',
          'p-4',
          'w-full',
          props.selected && !props.selectedAsset
            ? 'bg-white/10'
            : 'bg-transparent'
        )}
        onClick={props.onSelectWallet}
      >
        <div className={cx('gap-x-4', 'grid-cols-[1fr_max-content]', 'grid')}>
          <div className="flex flex-col items-start">
            <div className="grid items-center grid-cols-[16px_1fr] gap-x-1">
              {props.selected ? (
                <FolderOpenIcon className="h-4 w-4 stroke-white/50" />
              ) : (
                <FolderIcon className="h-4 w-4 stroke-white/50" />
              )}
              <div
                className={cx(
                  'font-bold',
                  'overflow-hidden',
                  'text-ellipsis',
                  'text-left',
                  'text-sm',
                  'whitespace-nowrap'
                )}
              >
                {props.wallet.name}
              </div>
            </div>
            <AssetsPreviewIconList
              assets={props.wallet.assets}
              className="pl-5 mt-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            {containsTokens && (
              <div className="font-bold text-lg text-white">
                ${formatNumber(props.wallet.totalValue)}
              </div>
            )}
            <ChevronDownIcon
              className={cx(
                'h-5',
                'transition-all',
                'w-5',
                props.selected || props.expanded ? '' : '-rotate-90',
                props.selected || props.expanded
                  ? 'text-[#00C2FF]'
                  : 'text-white/50'
              )}
              onClick={(e) => {
                e.stopPropagation()
                if (props.selected) {
                  props.onSelectWallet?.()
                } else {
                  props.onExpand?.()
                }
              }}
            />
          </div>
        </div>
      </button>
      {isOpen && (
        <AssetList
          assets={props.wallet.assets}
          className="bg-transparent"
          selectedAssetId={props.selectedAsset?.id}
          onSelectAsset={props.onSelectAsset}
        />
      )}
      <div
        className={cx(
          'absolute',
          'bottom-0',
          'left-0',
          'top-0',
          'w-1',
          props.selected
            ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
            : 'bg-transparent group-hover:bg-white/10'
        )}
      />
    </div>
  )
}
