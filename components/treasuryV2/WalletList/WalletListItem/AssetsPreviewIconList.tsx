import React from 'react'
import cx from 'classnames'
import { CollectionIcon } from '@heroicons/react/outline'

import {
  Asset,
  AssetType,
  Mint,
  RealmAuthority,
  Token,
  NFTCollection,
  Sol,
} from '@models/treasury/Asset'
import Tooltip from '@components/Tooltip'
import CommunityMintIcon from '@components/treasuryV2/icons/CommunityMintIcon'
import CouncilMintIcon from '@components/treasuryV2/icons/CouncilMintIcon'
import PlainRealmLogo from '@components/treasuryV2/icons/PlainRealmLogo'

function isToken(asset: Asset): asset is Token {
  return asset.type === AssetType.Token
}

function isNFTCollection(asset: Asset): asset is NFTCollection {
  return asset.type === AssetType.NFTCollection
}

function isSol(asset: Asset): asset is Sol {
  return asset.type === AssetType.Sol
}

function isCouncilMint(asset: Asset): asset is Mint {
  return asset.type === AssetType.Mint && asset.tokenRole === 'council'
}

function isCommunityMint(asset: Asset): asset is Mint {
  return asset.type === AssetType.Mint && asset.tokenRole === 'community'
}

function isRealmAuthority(asset: Asset): asset is RealmAuthority {
  return asset.type === AssetType.RealmAuthority
}

interface Props {
  className?: string
  assets: Asset[]
  showRealmAuthority?: boolean
  showMints?: boolean
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
  const councilMint: Mint | undefined = props.assets.filter(isCouncilMint)[0]
  const communityMint: Mint | undefined = props.assets.filter(
    isCommunityMint
  )[0]
  const realmAuthority: RealmAuthority | undefined = props.assets.filter(
    isRealmAuthority
  )[0]
  const assetCount = props.assets.length

  let otherCount = assetCount - tokens.length - nfts.length - sol.length

  if (props.showRealmAuthority && realmAuthority) {
    otherCount -= 1
  }

  if (props.showMints && councilMint) {
    otherCount -= 1
  }

  if (props.showMints && communityMint) {
    otherCount -= 1
  }

  const previewList: JSX.Element[] = []
  const summary: string[] = []

  let remainingCount = assetCount

  // Handle special cases first
  if (props.showRealmAuthority && realmAuthority) {
    previewList.push(<PlainRealmLogo className="fill-current" />)
    remainingCount--
    summary.push('the Realm Authority')
  }

  if (props.showMints && councilMint) {
    previewList.push(<CouncilMintIcon className="stroke-current" />)
    remainingCount--
    summary.push('the Council Mint')
  }

  if (props.showMints && communityMint) {
    previewList.push(<CommunityMintIcon className="stroke-current" />)
    remainingCount--
    summary.push('the Community Mint')
  }

  if (sol.length) {
    // If the wallet contains sol, show that
    previewList.push(sol[0].icon)
    remainingCount--
    summary.push('SOL')
  }

  // Display the tokens next
  if (tokens.length) {
    const list = tokens.sort((a, b) => {
      const aTotal = a.count.multipliedBy(a.value)
      const bTotal = b.count.multipliedBy(b.value)

      if (aTotal.eq(bTotal)) {
        return b.count.comparedTo(a.count)
      }

      return bTotal.comparedTo(aTotal)
    })
    // Show atleast one token
    previewList.push(list[0].icon)
    remainingCount--
    summary.push(list[0].symbol)

    // If the wallet does not have any Sol, we can show a second token
    if (!sol.length && list[1]) {
      previewList.push(list[1].icon)
      remainingCount--
      summary.push(list[1].symbol)
    }

    // If the wallet does not have any Nfts or any other assets, we can show
    // a third token
    if (!nfts.length && otherCount <= 0 && list[2]) {
      previewList.push(list[2].icon)
      remainingCount--
      summary.push(list[2].symbol)
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
              className: cx(item.props.className, 'w-4', 'h-4'),
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
