import React from 'react'
import cx from 'classnames'
import { ChevronDownIcon } from '@heroicons/react/outline'

import { AssetType } from '@models/treasury/Asset'
import { Wallet } from '@models/treasury/Wallet'
import { formatNumber } from '@utils/formatNumber'
import { abbreviateAddress } from '@utils/formatting'

import WalletIcon from '../../icons/WalletIcon'
import AssetsPreviewIconList from './AssetsPreviewIconList'

interface Props {
  className?: string
  expanded?: boolean
  selected?: boolean
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
        'h-24',
        'items-center',
        'justify-between',
        'm-0',
        'p-4',
        'relative',
        'transition-colors',
        'w-full',
        props.selected ? 'bg-white/10' : 'bg-bkg-1'
      )}
      onClick={props.onClick}
    >
      <div
        className={cx(
          'absolute',
          'bottom-0',
          'left-0',
          'top-0',
          'transition-colors',
          'w-1',
          props.selected &&
            'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
        )}
      />
      <div>
        <div className="grid items-center grid-cols-[16px_1fr] gap-x-1">
          <WalletIcon className="h-4 w-4" />
          <div className="font-bold text-sm text-left whitespace-nowrap text-ellipsis overflow-hidden">
            {props.wallet.name || abbreviateAddress(props.wallet.address)}
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
            props.onExpand?.()
          }}
        />
      </div>
    </button>
  )
}
