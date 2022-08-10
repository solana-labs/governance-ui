import React from 'react'
import cx from 'classnames'
import { CollectionIcon } from '@heroicons/react/outline'

import {
  Asset,
  AssetType,
  Token,
  NFTCollection,
  Sol,
} from '@models/treasury/Asset'
import Tooltip from '@components/Tooltip'

function isToken(asset: Asset): asset is Token {
  return asset.type === AssetType.Token
}

function isNFTCollection(asset: Asset): asset is NFTCollection {
  return asset.type === AssetType.NFTCollection
}

function isSol(asset: Asset): asset is Sol {
  return asset.type === AssetType.Sol
}

interface Props {
  className?: string
  assets: Asset[]
}

/**
 * Display a list of icons that represent the assets that can be found in the
 * wallet. We want to display a fair representation, so we're going to use the
 * following heuristic:
 *
 * 1. Don't show more than 3 icons
 * 2. If the wallet contains Sol, show that first
 * 3. Show the top tokens by total value. Can display up to three depending on
 *    whether or not we're showing other preview icons
 * 4. If the wallet contains nfts, show that
 * 5. If the wallet contains more than 3 assets, show a count after the icons
 */
export default function AssetsPreviewIconList(props: Props) {
  const tokens = props.assets
    .filter(isToken)
    .sort((a, b) => b.value.comparedTo(a.value))
  const nfts = props.assets.filter(isNFTCollection)
  const sol = props.assets.filter(isSol)
  const assetCount = props.assets.length
  const otherCount = assetCount - tokens.length - nfts.length - sol.length

  const previewList: JSX.Element[] = []
  const summary: string[] = []

  let remainingCount = assetCount

  // If the wallet contains sol, show that first
  if (sol.length) {
    previewList.push(sol[0].icon)
    remainingCount--
    summary.push('SOL')
  }

  // Display the tokens next
  if (tokens.length) {
    // Show atleast one token
    previewList.push(tokens[0].icon)
    remainingCount--
    summary.push(tokens[0].symbol)

    // If the wallet does not have any Sol, we can show a second token
    if (!sol.length && tokens[1]) {
      previewList.push(tokens[1].icon)
      remainingCount--
      summary.push(tokens[1].symbol)
    }

    // If the wallet does not have any Nfts or any other assets, we can show
    // a third token
    if (!nfts.length && otherCount <= 0 && tokens[2]) {
      previewList.push(tokens[2].icon)
      remainingCount--
      summary.push(tokens[2].symbol)
    }
  }

  // Display any NFTs
  if (nfts.length) {
    const icon = nfts[0].icon
    previewList.push(
      React.cloneElement(icon, {
        className: cx(icon.props.className, 'rounded'),
      })
    )
    remainingCount -= nfts.length
    summary.push('NFTs')
  }

  // If we have space, show an icon for remaining assets
  if (previewList.length < 3 && otherCount > 0) {
    previewList.push(<CollectionIcon className="stroke-fgd-1" />)
    remainingCount -= otherCount
  }

  if (remainingCount > 0 || otherCount > 0) {
    summary.push('other assets')
  }

  const summaryStr =
    'This wallet contains ' +
    summary.slice(0, summary.length - 1).join(', ') +
    (summary.length > 2 ? ', ' : ' ') +
    (summary.length > 1 ? 'and ' : '') +
    summary[summary.length - 1] +
    '.'

  return (
    <div className="flex">
      <Tooltip content={summaryStr}>
        <div
          className={cx(props.className, 'flex', 'items-center', 'space-x-1')}
        >
          {previewList.map((item, i) =>
            React.cloneElement(item, {
              className: cx(item.props.className, 'w-6', 'h-6'),
              key: i,
            })
          )}
          {remainingCount > 0 && (
            <div className="pl-1 text-fgd-1 text-base">+{remainingCount}</div>
          )}
        </div>
      </Tooltip>
    </div>
  )
}
