import React from 'react'
import { CollectionIcon } from '@heroicons/react/outline'

import {
  AssetType,
  Mint,
  Programs,
  RealmAuthority,
  Unknown,
} from '@models/treasury/Asset'

import Collapsible from './Collapsible'
import MintListItem from './MintListItem'
import ProgramsListItem from './ProgramsListItem'
import UnknownAssetListItem from './UnknownAssetListItem'
import RealmAuthorityListItem from './RealmAuthorityListItem'

interface Props {
  className?: string
  disableCollapse?: boolean
  expanded?: boolean
  assets: (Mint | Programs | RealmAuthority | Unknown)[]
  selectedAssetId?: string | null
  onSelect?(asset: Mint | Programs | RealmAuthority | Unknown): void
  onToggleExpand?(): void
}

export default function OtherAssetsList(props: Props) {
  return (
    <Collapsible
      className={props.className}
      count={props.assets.length}
      disableCollapse={props.disableCollapse}
      expanded={props.expanded}
      icon={<CollectionIcon className="stroke-white/50" />}
      title="Other Assets"
      onToggleExpand={props.onToggleExpand}
    >
      {props.assets.map((asset, i) => {
        switch (asset.type) {
          case AssetType.Mint:
            return (
              <MintListItem
                key={i}
                tokenName={asset.name}
                tokenSymbol={asset.symbol}
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
          case AssetType.RealmAuthority:
            return (
              <RealmAuthorityListItem
                key={i}
                name={asset.name}
                selected={props.selectedAssetId === asset.id}
                thumbnail={asset.icon}
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
