import { useDigitalAssetsByOwner } from '@hooks/queries/digitalAssets'
import { useNftRegistrarCollection } from '@hooks/useNftRegistrarCollection'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'

interface Props {
  className?: string
  voteType?: number
  highlighted?: string
}

function filterVerifiedCollections(nfts, usedCollectionsPks) {
  return nfts?.filter((nft) => {
    const collection = nft.grouping.find((x) => x.group_key === 'collection')
    return (
      collection &&
      usedCollectionsPks.includes(collection.group_value) &&
      nft.creators?.filter((x) => x.verified).length > 0
    )
  })
}

const ProposalVoterNftChart = (props: Props) => {
  const { data: nfts, isLoading } = useDigitalAssetsByOwner(
    props.highlighted ? new PublicKey(props.highlighted) : undefined
  )

  const usedCollectionsPks = useNftRegistrarCollection()
  const verifiedNfts = useMemo(
    () => filterVerifiedCollections(nfts, usedCollectionsPks),
    [nfts, usedCollectionsPks]
  )

  return (
    <div className="w-full">
      <h3>
        Voter<span>&#39;</span>s NFTs
      </h3>
      {!props.highlighted ? (
        <div className={props.className}>Move cursor to an account</div>
      ) : isLoading ? (
        <div className={props.className}>Loading NFTs...</div>
      ) : !verifiedNfts || verifiedNfts.length === 0 ? (
        <div className={props.className}>
          Something went wrong, fail to fetch...
        </div>
      ) : (
        <div
          className={`${props.className} grid grid-cols-10 gap-3 overflow-scroll`}
        >
          {verifiedNfts &&
            verifiedNfts.map((nft: any) => {
              return (
                <img
                  key={nft.id}
                  src={nft.content.links?.image || ''}
                  className={`w-full rounded-full ${
                    props.voteType && props.voteType === 1
                      ? 'grayscale'
                      : 'grayscale-0'
                  }`}
                  alt={nft.content.metadata.name}
                />
              )
            })}
        </div>
      )}
    </div>
  )
}

export default ProposalVoterNftChart
