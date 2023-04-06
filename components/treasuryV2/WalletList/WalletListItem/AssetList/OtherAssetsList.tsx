import React, { useState } from 'react'
import { CollectionIcon } from '@heroicons/react/outline'

import {
  AssetType,
  Mint,
  Domains,
  Programs,
  RealmAuthority,
  Unknown,
} from '@models/treasury/Asset'

import Collapsible from './Collapsible'
import MintListItem from './MintListItem'
import DomainListItem from './DomainListItem'
import ProgramsListItem from './ProgramsListItem'
import UnknownAssetListItem from './UnknownAssetListItem'
import RealmAuthorityListItem from './RealmAuthorityListItem'

interface Props {
  className?: string
  disableCollapse?: boolean
  expanded?: boolean
  assets: (Mint | Domains | Programs | RealmAuthority | Unknown)[]
  selectedAssetId?: string | null
  itemsToHide: string[]
  onSelect?(asset: Mint | Domains | Programs | RealmAuthority | Unknown): void
  onToggleExpand?(): void
}

export default function OtherAssetsList(props: Props) {
  const [showHiddenItems, setShowHiddenItems] = useState(false)

  return (
    <Collapsible
      className={props.className}
      count={props.assets.length}
      disableCollapse={props.disableCollapse}
      expanded={props.expanded}
      icon={<CollectionIcon className="stroke-white/50" />}
      title="Other Assets"
      onToggleExpand={props.onToggleExpand}
      onToggleHiddenItems={() => setShowHiddenItems(!showHiddenItems)}
      itemsToHide={props.itemsToHide}
      showHiddenItems={showHiddenItems}
    >
      {props.assets
        .filter((x) =>
          showHiddenItems
            ? true
            : !props.itemsToHide.includes((x as any).address)
        )
        .map((asset, i) => {
          switch (asset.type) {
            case AssetType.Mint:
              return (
                <MintListItem
                  key={i}
                  mint={asset}
                  selected={props.selectedAssetId === asset.id}
                  onSelect={() => props.onSelect?.(asset)}
                />
              )
            case AssetType.Domain:
              return (
                <DomainListItem
                  key={i}
                  count={asset.count}
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
