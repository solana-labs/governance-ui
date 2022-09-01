import React, { useEffect, useState, useMemo } from 'react'
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
  isTokenOwnerRecord,
} from '../typeGuards'

import { PublicKey } from '@solana/web3.js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { findMetadataPda } from '@metaplex-foundation/js'
import useWalletStore from 'stores/useWalletStore'
import TokenOwnerRecordsList from './TokenOwnerRecordsList'

export type Section = 'tokens' | 'nfts' | 'others'

function isTokenLike(asset: Asset): asset is Token | Sol {
  return isToken(asset) || isSol(asset)
}

function isOther(
  asset: Asset
): asset is Mint | Programs | Unknown | RealmAuthority {
  return (
    isMint(asset) ||
    isPrograms(asset) ||
    isUnknown(asset) ||
    isRealmAuthority(asset)
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
  }, [])

  const [tokens, setTokens] = useState<(Token | Sol)[]>(tokensFromProps)
  const connection = useWalletStore((s) => s.connection)

  useEffect(() => {
    const getTokenMetadata = async (mintAddress: string) => {
      try {
        const mintPubkey = new PublicKey(mintAddress)
        const metadataAccount = findMetadataPda(mintPubkey)
        const accountData = await connection.current.getAccountInfo(
          metadataAccount
        )

        const state = Metadata.deserialize(accountData!.data)
        const jsonUri = state[0].data.uri.slice(
          0,
          state[0].data.uri.indexOf('\x00')
        )

        const data = await (await fetch(jsonUri)).json()
        return {
          image: data.image,
          symbol: data.symbol,
          name: data.name,
        }
      } catch (e) {
        console.log(e)
      }
    }

    const getTokenData = async () => {
      const newTokens: (Token | Sol)[] = []
      for await (const token of tokensFromProps) {
        if (
          token.type != AssetType.Sol &&
          token.logo == undefined &&
          token.mintAddress
        ) {
          const newTokenData = await getTokenMetadata(token.mintAddress)

          if (!newTokenData) {
            newTokens.push(token)
            continue
          }

          newTokens.push({
            ...token,
            icon: <img src={newTokenData.image} className="rounded-full" />,
            name: newTokenData.name,
            symbol: newTokenData.symbol,
          })
        } else {
          newTokens.push(token)
        }
      }
      setTokens(newTokens)
    }
    getTokenData()
  }, [tokensFromProps])

  const nfts = props.assets.filter(isNFTCollection).sort((a, b) => {
    if (b.name && !a.name) {
      return 1
    } else if (!b.name && a.name) {
      return -1
    } else {
      return b.count.comparedTo(a.count)
    }
  })

  const othersFromProps = useMemo(() => props.assets.filter(isOther), [])

  const tokenOwnerRecordsFromProps = useMemo(
    () => props.assets.filter(isTokenOwnerRecord),
    []
  )

  const [others, setOthers] = useState<
    (Mint | Programs | Unknown | RealmAuthority)[]
  >(othersFromProps)

  useEffect(() => {
    const getTokenMetadata = async (mintAddress: string) => {
      try {
        const mintPubkey = new PublicKey(mintAddress)
        const metadataAccount = findMetadataPda(mintPubkey)
        const accountData = await connection.current.getAccountInfo(
          metadataAccount
        )

        const state = Metadata.deserialize(accountData!.data)
        const jsonUri = state[0].data.uri.slice(
          0,
          state[0].data.uri.indexOf('\x00')
        )

        const data = await (await fetch(jsonUri)).json()
        return {
          image: data.image,
          symbol: data.symbol,
          name: data.name,
        }
      } catch (e) {
        console.log(e)
      }
    }

    const getTokenData = async () => {
      const newTokens: (Mint | Programs | Unknown | RealmAuthority)[] = []
      for await (const token of othersFromProps) {
        if (isMint(token)) {
          const newTokenData = await getTokenMetadata(token.address)

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
    getTokenData()
  }, [othersFromProps])

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
