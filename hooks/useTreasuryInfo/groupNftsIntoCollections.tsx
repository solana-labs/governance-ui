import { BigNumber } from 'bignumber.js'

import NFTCollectionPreviewIcon from '@components/treasuryV2/icons/NFTCollectionPreviewIcon'
import { AssetType, NFTCollection } from '@models/treasury/Asset'
import { NFT } from '@models/treasury/NFT'
import OutsideSrcImg from '@components/OutsideSrcImg'

export function groupNftsIntoCollections(nfts: NFT[]): NFTCollection[] {
  const nftCollections: { [address: string]: NFT[] } = {}
  const nftsWithoutCollection: NFT[] = []

  for (const nft of nfts) {
    if (nft.collection) {
      if (!nftCollections[nft.collection.address]) {
        nftCollections[nft.collection.address] = []
      }

      nftCollections[nft.collection.address].push(nft)
    } else {
      nftsWithoutCollection.push(nft)
    }
  }

  return Object.values(nftCollections)
    .map(
      (nfts) =>
        ({
          type: AssetType.NFTCollection,
          address: nfts[0].collection?.address,
          id: nfts[0].collection?.address || nfts[0].address,
          count: new BigNumber(nfts.length),
          icon: nfts[0].collection?.image ? (
            <OutsideSrcImg src={nfts[0].collection?.image} />
          ) : (
            <NFTCollectionPreviewIcon className="stroke-fgd-1" />
          ),
          list: nfts,
          name: nfts[0].collection?.name || 'Collection',
          totalCount: nfts[0].collection?.nftCount
            ? new BigNumber(nfts[0].collection.nftCount)
            : undefined,
        } as const)
    )
    .concat(
      nftsWithoutCollection.length
        ? ({
            type: AssetType.NFTCollection,
            address: undefined,
            id: 'nfts-without-collections',
            count: new BigNumber(nftsWithoutCollection.length),
            icon: <NFTCollectionPreviewIcon className="stroke-fgd-1" />,
            list: nftsWithoutCollection,
            name: '',
            totalCount: undefined,
          } as const)
        : []
    )
}
