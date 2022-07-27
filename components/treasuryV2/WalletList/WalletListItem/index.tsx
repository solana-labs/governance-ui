import React from 'react'
import cx from 'classnames'

import { Asset } from '@models/treasury/Asset'
import { Wallet } from '@models/treasury/Wallet'

import AssetList from './AssetList'
import SummaryButton from './SummaryButton'

interface Props {
  className?: string
  expanded?: boolean
  selected?: boolean
  selectedAsset?: Asset | null
  wallet: Wallet
  onExpand?(): void
  onSelectAsset?(asset: Asset): void
  onSelectWallet?(): void
}

export default function WalletListItem(props: Props) {
  const isOpen = props.expanded || props.selected

  return (
    <div
      className={cx(
        props.className,
        'group',
        'overflow-hidden',
        'relative',
        'rounded',
        isOpen ? 'h-fit' : 'h-24'
      )}
    >
      <SummaryButton
        wallet={props.wallet}
        expanded={props.expanded || !!(props.selected && props.selectedAsset)}
        selected={props.selected && !props.selectedAsset}
        onExpand={() => {
          if (props.selected) {
            props.onSelectWallet?.()
          } else {
            props.onExpand?.()
          }
        }}
        onClick={props.onSelectWallet}
      />
      {isOpen && (
        <AssetList
          assets={props.wallet.assets}
          className={props.selected ? 'bg-black' : undefined}
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
            ? 'bg-white/10'
            : 'bg-transparent group-hover:bg-white/10'
        )}
      />
    </div>
  )
}
