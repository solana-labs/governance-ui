import React from 'react'
import cx from 'classnames'
import { CollectionIcon } from '@heroicons/react/outline'

import {
  Asset,
  AssetType,
  Domains,
  Mint,
  Programs,
  RealmAuthority,
  Token,
  Sol,
} from '@models/treasury/Asset'
import Tooltip from '@components/Tooltip'
import CommunityMintIcon from '@components/treasuryV2/icons/CommunityMintIcon'
import CouncilMintIcon from '@components/treasuryV2/icons/CouncilMintIcon'
import PlainRealmLogo from '@components/treasuryV2/icons/PlainRealmLogo'
import { ntext } from '@utils/ntext'
import useGovernanceNfts from './AssetList/useGovernanceNfts'
import { PublicKey } from '@solana/web3.js'
import NFTCollectionPreviewIcon from '@components/treasuryV2/icons/NFTCollectionPreviewIcon'
import { useDigitalAssetById } from '@hooks/queries/digitalAssets'

function isDomains(asset: Asset): asset is Domains {
  return asset.type === AssetType.Domain
}

function isToken(asset: Asset): asset is Token {
  return asset.type === AssetType.Token
}

function isPrograms(asset: Asset): asset is Programs {
  return asset.type === AssetType.Programs
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

const NftPreviewIcon = ({
  collectionId,
}: {
  collectionId: PublicKey | undefined
}) => {
  const { data: collectionNft } = useDigitalAssetById(collectionId)
  const imageUri =
    collectionNft?.result?.content.files[0]?.cdn_uri ??
    collectionNft?.result?.content.files[0]?.uri

  return (
    <>
      {imageUri !== undefined ? (
        <img src={imageUri} className="rounded w-4 h-4" />
      ) : (
        <NFTCollectionPreviewIcon className="stroke-fgd-1 rounded w-4 h-4" />
      )}
    </>
  )
}

interface Props {
  className?: string
  assets: Asset[]
  showRealmAuthority?: boolean
  showMints?: boolean
  governance: PublicKey | undefined
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
  const nfts = useGovernanceNfts(props.governance) ?? []
  const tokens = props.assets
    .filter(isToken)
    .sort((a, b) => b.value.comparedTo(a.value))
  const sol = props.assets.filter(isSol)
  const councilMint: Mint | undefined = props.assets.filter(isCouncilMint)[0]
  const communityMint: Mint | undefined = props.assets.filter(
    isCommunityMint
  )[0]
  const realmAuthority: RealmAuthority | undefined = props.assets.filter(
    isRealmAuthority
  )[0]
  const assetCount = props.assets.length
  let unaccounted = [...props.assets]
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

  let remainingCount = assetCount + nfts.length

  // Handle special cases first
  if (props.showRealmAuthority && realmAuthority) {
    previewList.push(<PlainRealmLogo className="fill-current" />)
    remainingCount--
    summary.push('the Realm Authority')
    unaccounted = unaccounted.filter((item) => !isRealmAuthority(item))
  }

  if (props.showMints && councilMint) {
    previewList.push(<CouncilMintIcon className="stroke-current" />)
    remainingCount--
    summary.push('the Council Mint')
    unaccounted = unaccounted.filter((item) => !isCouncilMint(item))
  }

  if (props.showMints && communityMint) {
    previewList.push(<CommunityMintIcon className="stroke-current" />)
    remainingCount--
    summary.push('the Community Mint')
    unaccounted = unaccounted.filter((item) => !isCommunityMint(item))
  }

  if (sol.length) {
    // If the wallet contains sol, show that
    previewList.push(sol[0].icon)
    remainingCount--
    summary.push('SOL')
    unaccounted = unaccounted.filter((item) => !isSol(item))
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
    unaccounted = unaccounted.filter((item) => {
      if (isToken(item)) {
        return item.address !== list[0].address
      }

      return true
    })

    // If the wallet does not have any Sol, we can show a second token
    if (!sol.length && list[1]) {
      previewList.push(list[1].icon)
      remainingCount--
      summary.push(list[1].symbol)
      unaccounted = unaccounted.filter((item) => {
        if (isToken(item)) {
          return item.address !== list[1].address
        }

        return true
      })
    }

    // If the wallet does not have any Nfts or any other assets, we can show
    // a third token
    if (!nfts.length && otherCount <= 0 && list[2]) {
      previewList.push(list[2].icon)
      remainingCount--
      summary.push(list[2].symbol)
      unaccounted = unaccounted.filter((item) => {
        if (isToken(item)) {
          return item.address !== list[2].address
        }

        return true
      })
    }
  }

  // Display any NFTs
  if (nfts.length) {
    // enhancement: show an nft collection icon using some non-arbitrary logic
    previewList.push(<NftPreviewIcon collectionId={undefined} />)
    remainingCount -= nfts.length
    summary.push('NFTs')
  }

  // If we have space, show an icon for remaining assets
  if (previewList.length < 3 && otherCount > 0) {
    previewList.push(<CollectionIcon className="stroke-fgd-1" />)
    remainingCount -= otherCount
  }

  if (remainingCount > 0 || otherCount > 0) {
    const remainingTokens = unaccounted.filter(isToken).length
    const remainingDomains = unaccounted.filter(isDomains).length
    const remainingPrograms = unaccounted.filter(isPrograms).length
    const remainingOther =
      unaccounted.length -
      remainingTokens -
      remainingDomains -
      remainingPrograms

    if (remainingTokens) {
      summary.push(
        `${remainingTokens} ${ntext(remainingTokens, 'other token')}`
      )
    }

    if (remainingDomains) {
      summary.push(`${remainingDomains} ${ntext(remainingDomains, 'domain')}`)
    }

    if (remainingPrograms) {
      summary.push(
        `${remainingPrograms} ${ntext(remainingPrograms, 'program')}`
      )
    }

    if (remainingOther) {
      summary.push('other assets')
    }
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
