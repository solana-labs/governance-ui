import React from 'react'

import { AssetType, Mint, Programs, Unknown } from '@models/treasury/Asset'

import Collapsible from './Collapsible'
import OtherPreviewIcon from '../../../icons/OtherPreviewIcon'
import MintListItem from './MintListItem'
import ProgramsListItem from './ProgramsListItem'
import UnknownAssetListItem from './UnknownAssetListItem'

interface Props {
  className?: string
  disableCollapse?: boolean
  assets: (Mint | Programs | Unknown)[]
  selectedAssetId?: string | null
  onSelect?(asset: Mint | Programs | Unknown): void
}

export default function OtherAssetsList(props: Props) {
  return (
    <Collapsible
      className={props.className}
      count={props.assets.length}
      disableCollapse={props.disableCollapse}
      icon={<OtherPreviewIcon className="stroke-white/50" />}
      title="Other Assets"
    >
      {props.assets.map((asset, i) => {
        switch (asset.type) {
          case AssetType.Mint:
            return (
              <MintListItem
                key={i}
                tokenName={asset.name}
                tokenType={asset.tokenType}
                totalSupply={asset.totalSupply}
                selected={props.selectedAssetId === asset.id}
                onSelect={() => props.onSelect?.(asset)}
              />
            )
          case AssetType.Programs:
            return (
              <ProgramsListItem
                key={i}
                count={asset.count}
                selected={props.selectedAssetId === asset.id}
                onSelect={() => props.onSelect?.(asset)}
              />
            )
          case AssetType.Unknown:
            return (
              <UnknownAssetListItem
                key={i}
                count={asset.count}
                name={asset.name}
                selected={props.selectedAssetId === asset.id}
                thumbnail={asset.icon}
                onSelect={() => props.onSelect?.(asset)}
              />
            )
        }
      })}
    </Collapsible>
  )
}
