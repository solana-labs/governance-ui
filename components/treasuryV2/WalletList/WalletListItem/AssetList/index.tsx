import React from 'react'
import cx from 'classnames'

import {
  Asset,
  Token,
  Sol,
  Mint,
  Programs,
  Unknown,
} from '@models/treasury/Asset'

import TokenList from './TokenList'
import NFTList from './NFTList'
import OtherAssetsList from './OtherAssetsList'

import {
  isToken,
  isSol,
  isNFTCollection,
  isMint,
  isPrograms,
  isUnknown,
} from '../typeGuards'

function isTokenLike(asset: Asset): asset is Token | Sol {
  return isToken(asset) || isSol(asset)
}

function isOther(asset: Asset): asset is Mint | Programs | Unknown {
  return isMint(asset) || isPrograms(asset) || isUnknown(asset)
}

interface Props {
  className?: string
  assets: Asset[]
  selectedAssetId?: string | null
  onSelectAsset?(asset: Asset): void
}

export default function AssetList(props: Props) {
  const tokens = props.assets
    .filter(isTokenLike)
    .sort((a, b) => b.value.comparedTo(a.value))

  const nfts = props.assets.filter(isNFTCollection).sort((a, b) => {
    if (b.name && !a.name) {
      return 1
    } else if (!b.name && a.name) {
      return -1
    } else {
      return b.count.comparedTo(a.count)
    }
  })

  const others = props.assets.filter(isOther)

  const diplayingMultipleAssetTypes =
    (tokens.length > 0 ? 1 : 0) +
      (nfts.length > 0 ? 1 : 0) +
      (others.length > 0 ? 1 : 0) >
    1

  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-1',
        'p-3',
        'relative',
        'space-y-6'
      )}
    >
      {props.assets.length === 0 && (
        <div className="p-4 text-center text-sm text-fgd-1">
          This wallet contains no assets
        </div>
      )}
      {tokens.length > 0 && (
        <TokenList
          disableCollapse={!diplayingMultipleAssetTypes}
          tokens={tokens}
          selectedAssetId={props.selectedAssetId}
          onSelect={props.onSelectAsset}
        />
      )}
      {nfts.length > 0 && (
        <NFTList
          disableCollapse={!diplayingMultipleAssetTypes}
          nfts={nfts}
          selectedAssetId={props.selectedAssetId}
          onSelect={props.onSelectAsset}
        />
      )}
      {others.length > 0 && (
        <OtherAssetsList
          disableCollapse={!diplayingMultipleAssetTypes}
          assets={others}
          selectedAssetId={props.selectedAssetId}
          onSelect={props.onSelectAsset}
        />
      )}
    </div>
  )
}
