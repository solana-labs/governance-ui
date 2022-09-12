import React, { useState } from 'react'
import cx from 'classnames'

import { Asset } from '@models/treasury/Asset'
import { Wallet } from '@models/treasury/Wallet'

import AssetList, { Section } from './AssetList'
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
  const [expandedSections, setExpandedSections] = useState<Section[]>([])
  const isOpen = props.expanded

  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-3',
        'group',
        'overflow-hidden',
        'relative',
        'rounded',
        isOpen ? 'h-fit' : 'h-[104px]'
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
          props.selected && !props.expanded
            ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
            : 'bg-transparent'
        )}
      />
      <div
        className={cx(
          'p-2',
          'transition-colors',
          !isOpen && 'group-hover:bg-bkg-1',
          props.selected &&
            !props.expanded &&
            !props.selectedAsset &&
            'bg-bkg-1'
        )}
      >
        <SummaryButton
          wallet={props.wallet}
          expanded={props.expanded}
          selected={props.selected}
          selectedAsset={!!props.selectedAsset}
          onExpand={props.onExpand}
          onClick={props.onSelectWallet}
        />
      </div>
      {isOpen && (
        <div className="p-2">
          <AssetList
            assets={props.wallet.assets}
            className="pt-4"
            expandedSections={expandedSections}
            selectedAssetId={props.selectedAsset?.id}
            onSelectAsset={props.onSelectAsset}
            onToggleExpandSection={(section) =>
              setExpandedSections((current) => {
                if (current.includes(section)) {
                  return current.filter((s) => s !== section)
                } else {
                  return current.concat(section)
                }
              })
            }
          />
        </div>
      )}
    </div>
  )
}
