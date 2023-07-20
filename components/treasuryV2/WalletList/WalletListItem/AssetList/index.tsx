import { useEffect, useState, useMemo } from 'react'
import cx from 'classnames'

import {
  Asset,
  Token,
  Sol,
  Mint,
  Programs,
  RealmAuthority,
  Unknown,
  AssetType,
  Domains,
  Stake,
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
  isRealmAuthority,
  isUnknown,
  isDomain,
  isTokenOwnerRecord,
  isStake,
} from '../typeGuards'

import { PublicKey } from '@solana/web3.js'
import TokenOwnerRecordsList from './TokenOwnerRecordsList'
import { GoverningTokenType } from '@solana/spl-governance'
import TokenIcon from '@components/treasuryV2/icons/TokenIcon'
import { useTokensMetadata } from '@hooks/queries/tokenMetadata'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'

export type Section = 'tokens' | 'nfts' | 'others'

function isTokenLike(asset: Asset): asset is Token | Sol {
  return isToken(asset) || isSol(asset)
}

function isOther(
  asset: Asset
): asset is Mint | Programs | Unknown | Domains | RealmAuthority | Stake {
  return (
    isMint(asset) ||
    isPrograms(asset) ||
    isUnknown(asset) ||
    isRealmAuthority(asset) ||
    isDomain(asset) ||
    isStake(asset)
  )
}

interface Props {
  className?: string
  assets: Asset[]
  expandedSections?: Section[]
  selectedAssetId?: string | null
  onSelectAsset?(asset: Asset): void
  onToggleExpandSection?(section: Section): void
}

export default function AssetList(props: Props) {
  const tokensFromProps = useMemo(() => {
    return props.assets
      .filter(isTokenLike)
      .sort((a, b) => b.value.comparedTo(a.value))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])
  const tokensFromPropsFiltered = tokensFromProps.filter(
    (token) =>
      token.type != AssetType.Sol &&
      token.logo == undefined &&
      token.mintAddress
  ) as Token[]
  // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  const othersFromProps = useMemo(() => props.assets.filter(isOther), [])
  const otherFromPropsFiltred = othersFromProps.filter((token) =>
    isMint(token)
  ) as Mint[]

  const { data } = useTokensMetadata([
    ...tokensFromPropsFiltered.map((x) => new PublicKey(x.mintAddress!)),
    ...otherFromPropsFiltred.map((x) => new PublicKey(x.address)),
  ])
  const [tokens, setTokens] = useState<(Token | Sol)[]>(tokensFromProps)
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const isCommunityMintDisabled =
    config?.account.communityTokenConfig?.tokenType ===
      GoverningTokenType.Dormant || false
  const isCouncilMintDisabled =
    config?.account?.councilTokenConfig?.tokenType ===
      GoverningTokenType.Dormant || false

  useEffect(() => {
    const getTokenData = async () => {
      const newTokens: (Token | Sol)[] = []
      for await (const token of tokensFromProps) {
        if (
          token.type != AssetType.Sol &&
          token.logo == undefined &&
          token.mintAddress
        ) {
          const newTokenData = data?.find((x) => x.mint === token.mintAddress)

          if (!newTokenData) {
            newTokens.push(token)
            continue
          }

          newTokens.push({
            ...token,
            icon: <TokenIcon></TokenIcon>,
            name: newTokenData.name,
            symbol: newTokenData.symbol,
          })
        } else {
          newTokens.push(token)
        }
      }
      setTokens(newTokens)
    }
    if (data && data?.length) {
      getTokenData()
    }
  }, [tokensFromProps, data])

  const nfts = props.assets.filter(isNFTCollection).sort((a, b) => {
    if (b.name && !a.name) {
      return 1
    } else if (!b.name && a.name) {
      return -1
    } else {
      return b.count.comparedTo(a.count)
    }
  })

  const tokenOwnerRecordsFromProps = useMemo(
    () => props.assets.filter(isTokenOwnerRecord),
    [props.assets]
  )

  // NOTE possible source of bugs, state wont update if props do.
  const [others, setOthers] = useState<
    (Mint | Programs | Unknown | Domains | RealmAuthority | Stake)[]
  >(othersFromProps)
  const [itemsToHide, setItemsToHide] = useState<string[]>([])
  useEffect(() => {
    const newItemsToHide: string[] = []
    if (isCommunityMintDisabled && realm?.account.communityMint) {
      newItemsToHide.push(realm.account.communityMint.toBase58())
    }
    if (isCouncilMintDisabled && realm?.account.config.councilMint) {
      newItemsToHide.push(realm.account.config.councilMint.toBase58())
    }
    setItemsToHide(newItemsToHide)
  }, [isCommunityMintDisabled, isCouncilMintDisabled])

  useEffect(() => {
    const getTokenData = async () => {
      const newTokens: (
        | Mint
        | Programs
        | Unknown
        | Domains
        | RealmAuthority
        | Stake
      )[] = []
      for await (const token of othersFromProps) {
        if (isMint(token)) {
          const newTokenData = data?.find((x) => x.mint === token.address)

          if (!newTokenData) {
            newTokens.push(token)
            continue
          }

          newTokens.push({
            ...token,
            name: newTokenData.name,
            symbol: newTokenData.symbol,
          })
        } else {
          newTokens.push(token)
        }
      }
      setOthers(newTokens)
    }
    if (data) {
      getTokenData()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [othersFromProps, data])

  const diplayingMultipleAssetTypes =
    (tokens.length > 0 ? 1 : 0) +
      (nfts.length > 0 ? 1 : 0) +
      (others.length > 0 ? 1 : 0) >
    1

  return (
    <div className={cx(props.className, 'relative', 'space-y-6')}>
      {props.assets.length === 0 && (
        <div className="p-4 text-center text-sm text-fgd-1">
          This wallet contains no assets
        </div>
      )}
      {tokens.length > 0 && (
        <TokenList
          disableCollapse={!diplayingMultipleAssetTypes}
          expanded={props.expandedSections?.includes('tokens')}
          tokens={tokens}
          selectedAssetId={props.selectedAssetId}
          onSelect={props.onSelectAsset}
          onToggleExpand={() => props.onToggleExpandSection?.('tokens')}
        />
      )}
      {}
      {nfts.length > 0 && (
        <NFTList
          disableCollapse={!diplayingMultipleAssetTypes}
          expanded={props.expandedSections?.includes('nfts')}
          nfts={nfts}
          selectedAssetId={props.selectedAssetId}
          onSelect={props.onSelectAsset}
          onToggleExpand={() => props.onToggleExpandSection?.('nfts')}
        />
      )}
      {others.length > 0 && (
        <OtherAssetsList
          disableCollapse={!diplayingMultipleAssetTypes}
          expanded={props.expandedSections?.includes('others')}
          assets={others}
          selectedAssetId={props.selectedAssetId}
          onSelect={props.onSelectAsset}
          onToggleExpand={() => props.onToggleExpandSection?.('others')}
          itemsToHide={itemsToHide}
        />
      )}
      {tokenOwnerRecordsFromProps.length > 0 && (
        <TokenOwnerRecordsList
          disableCollapse={false}
          expanded={true}
          assets={tokenOwnerRecordsFromProps}
          selectedAssetId={props.selectedAssetId}
          onSelect={props.onSelectAsset}
          onToggleExpand={() => props.onToggleExpandSection?.('others')}
        />
      )}
    </div>
  )
}
