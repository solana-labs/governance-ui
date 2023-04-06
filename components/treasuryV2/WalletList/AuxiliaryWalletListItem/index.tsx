import React from 'react'
import cx from 'classnames'
import { ChevronDownIcon } from '@heroicons/react/outline'

import { AssetType, Asset } from '@models/treasury/Asset'
import { AuxiliaryWallet } from '@models/treasury/Wallet'
import { formatNumber } from '@utils/formatNumber'

import AssetsPreviewIconList from '../WalletListItem/AssetsPreviewIconList'
import AssetList from '../WalletListItem/AssetList'
import SelectedWalletIcon from '../../icons/SelectedWalletIcon'
import UnselectedWalletIcon from '../../icons/UnselectedWalletIcon'

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
  const isOpen = props.expanded

  return (
    <div
      className={cx(
        props.className,
        'border-dashed',
        'border-white/30',
        'border',
        'group',
        'overflow-hidden',
        'p-2',
        'relative',
        'rounded'
      )}
    >
      <div
        className={cx(
          'absolute',
          'bottom-0',
          'left-0',
          'top-0',
          'transition-all',
          'w-1',
          props.selected && !props.expanded && !!props.selectedAsset
            ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
            : 'bg-transparent'
        )}
      />
      <button
        className={cx(
          'h-[88px]',
          'overflow-hidden',
          'p-4',
          'relative',
          'rounded',
          'w-full',
          props.selected && !props.selectedAsset
            ? 'bg-bkg-1'
            : props.expanded
            ? 'bg-transparent hover:bg-bkg-1'
            : undefined
        )}
        onClick={props.onSelectWallet}
      >
        <div
          className={cx(
            'absolute',
            'bottom-0',
            'left-0',
            'top-0',
            'transition-all',
            'w-1',
            props.selected && !props.selectedAsset
              ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
              : 'bg-transparent'
          )}
        />
        <div
          className={cx(
            'gap-x-4',
            'grid-cols-[1fr_max-content]',
            'grid',
            'items-center'
          )}
        >
          <div className="flex flex-col items-start">
            <div className="grid items-center grid-cols-[40px_1fr] gap-x-3">
              <div className="h-10 w-10 relative">
                <SelectedWalletIcon
                  className={cx(
                    'absolute',
                    'h-10',
                    'w-10',
                    'top-0',
                    'left-0',
                    'transition-opacity',
                    props.selected ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <UnselectedWalletIcon
                  className={cx(
                    'absolute',
                    'h-10',
                    'w-10',
                    'top-0',
                    'left-0',
                    'transition-opacity',
                    props.selected ? 'opacity-0' : 'opacity-100'
                  )}
                />
              </div>
              <div
                className={cx(
                  'font-bold',
                  'overflow-hidden',
                  'text-ellipsis',
                  'text-left',
                  'whitespace-nowrap'
                )}
              >
                {props.wallet.name}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-end">
              {containsTokens && (
                <div className="font-bold text-lg text-white">
                  ${formatNumber(props.wallet.totalValue)}
                </div>
              )}
              <AssetsPreviewIconList
                assets={props.wallet.assets}
                className="pl-5 mt-1"
              />
            </div>
            <ChevronDownIcon
              className={cx(
                'h-5',
                'transition-all',
                'w-5',
                props.expanded ? '' : '-rotate-90',
                props.selected ? 'text-[#00C2FF]' : 'text-white/50'
              )}
              onClick={(e) => {
                e.stopPropagation()
                props.onExpand?.()
              }}
            />
          </div>
        </div>
      </button>
      {isOpen && (
        <AssetList
          assets={props.wallet.assets}
          className="pt-4"
          selectedAssetId={props.selectedAsset?.id}
          onSelectAsset={props.onSelectAsset}
        />
      )}
    </div>
  )
}
