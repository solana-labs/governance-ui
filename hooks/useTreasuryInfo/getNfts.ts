import { PublicKey } from '@solana/web3.js'

import { NFT } from '@models/treasury/NFT'
import { getNFTsByOwner } from '@utils/tokens'

export async function getNfts(owners: string[]): Promise<NFT[]> {
  return Promise.all(
    owners.map((owner) => getNFTsByOwner(new PublicKey(owner)))
  )
    .then((result) => result.flat())
    .then((nfts) =>
      nfts.map((nft) => ({
        address: nft.address,
        collection: {
          address: nft.collection.mintAddress,
          name: nft.collection.name,
          nftCount: nft.collection.count?.toNumber(),
          image: nft.collection.image,
        },
        image: nft.image,
        name: nft.name,
        owner: {
          address: nft.owner?.toBase58() || '',
        },
      }))
    )
}
