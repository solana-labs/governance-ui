import { useDigitalAssetsByOwner } from '@hooks/queries/digitalAssets'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

interface Props {
  showNfts: boolean
  isNftMode: boolean
  className?: string
  voteType?: number
  highlighted?: string
}

const getContents = (css, isLoading, highlighted, nfts, voteType) => {
  if (!highlighted) {
    return <div className={`${css}`}>Move cursor to an account</div>
  } else if (isLoading) {
    return <div className={`${css}`}>Loading NFTs...</div>
  } else if (!nfts || nfts.length === 0) {
    return (
      <div className={`${css}`}>Something went wrong, fail to fetch...</div>
    )
  } else {
    return (
      <div className={`grid grid-cols-10 gap-3 ${css} overflow-scroll`}>
        {nfts &&
          nfts.map((nft: any) => {
            return (
              <img
                key={nft.id}
                src={nft.content.links?.image || ''}
                className={`w-full rounded-full ${
                  voteType && voteType === 1 ? 'grayscale' : 'grayscale-0'
                }`}
                alt={nft.content.metadata.name}
              />
            )
          })}
      </div>
    )
  }
}
function filterVerifiedCollections(nfts, usedCollectionsPks) {
  return nfts?.filter((nft) => {
    const collection = nft.grouping.find((x) => x.group_key === 'collection')
    return (
      collection &&
      usedCollectionsPks.includes(collection.group_value) &&
      (collection.verified || typeof collection.verified === 'undefined') &&
      nft.creators?.filter((x) => x.verified).length > 0
    )
  })
}

const ProposalTopVotersNftChart = (props: Props) => {
  const { data: nfts, isLoading } = useDigitalAssetsByOwner(
    props.highlighted ? new PublicKey(props.highlighted) : undefined
  )
  const [nftMintRegistrar] = useVotePluginsClientStore((s) => [
    s.state.nftMintRegistrar,
  ])
  const usedCollectionsPks: string[] = useMemo(
    () =>
      (props.isNftMode &&
        nftMintRegistrar?.collectionConfigs.map((x) =>
          x.collection.toBase58()
        )) ||
      [],
    [nftMintRegistrar?.collectionConfigs, props.isNftMode]
  )

  const verifiedNfts = useMemo(
    () => filterVerifiedCollections(nfts, usedCollectionsPks),
    [nfts, usedCollectionsPks]
  )

  return (
    <div className={`${props.showNfts ? 'visible' : 'hidden'}  w-full`}>
      <h3>
        Voter<span>&#39;</span>s NFTs
      </h3>
      {getContents(
        props.className,
        isLoading,
        props.highlighted,
        verifiedNfts,
        props.voteType
      )}
    </div>
  )
}

export default ProposalTopVotersNftChart
