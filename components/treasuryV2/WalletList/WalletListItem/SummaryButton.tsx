import React from 'react'
import cx from 'classnames'
import { ChevronDownIcon } from '@heroicons/react/outline'

import { AssetType } from '@models/treasury/Asset'
import { Wallet } from '@models/treasury/Wallet'
import { formatNumber } from '@utils/formatNumber'
import { abbreviateAddress } from '@utils/formatting'

import SelectedWalletIcon from '../../icons/SelectedWalletIcon'
import UnselectedWalletIcon from '../../icons/UnselectedWalletIcon'
import AssetsPreviewIconList from './AssetsPreviewIconList'

interface Props {
  className?: string
  expanded?: boolean
  selected?: boolean
  selectedAsset?: boolean
  wallet: Wallet
  onClick?(): void
  onExpand?(): void
}

export default function SummaryButton(props: Props) {
  const containsTokens = props.wallet.assets.some(
    (asset) => asset.type === AssetType.Token || asset.type === AssetType.Sol
  )

  return (
    <button
      className={cx(
        props.className,
        'cursor-pointer',
        'gap-x-4',
        'grid-cols-[1fr_max-content]',
        'grid',
        'group',
        'h-[88px]',
        'items-center',
        'justify-between',
        'm-0',
        'overflow-hidden',
        'p-4',
        'relative',
        'rounded',
        'transition-colors',
        'w-full',
        props.selected && !props.selectedAsset && props.expanded
          ? 'bg-bkg-1'
          : props.expanded
          ? 'bg-bkg-2 hover:bg-bkg-1'
          : undefined
      )}
      onClick={props.onClick}
    >
      <div
        className={cx(
          'absolute',
          'bottom-0',
          'left-0',
          'top-0',
          'transition-all',
          'w-1',
          props.selected &&
            props.expanded &&
            !props.selectedAsset &&
            'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
        )}
      />
      <div>
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
          <div className="font-bold text-left whitespace-nowrap text-ellipsis overflow-hidden">
            {props.wallet.name || abbreviateAddress(props.wallet.address)}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex flex-col items-end">
          {containsTokens && (
            <div className="font-bold text-white">
              ${formatNumber(props.wallet.totalValue)}
            </div>
          )}
          <AssetsPreviewIconList
            showMints
            showRealmAuthority
            assets={props.wallet.assets}
            className="mt-1"
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
    </button>
  )
}
