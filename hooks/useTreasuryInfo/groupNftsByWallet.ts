import { NFT } from '@models/treasury/NFT'

export function groupNftsByWallet(nfts: NFT[]) {
  return nfts.reduce((acc, nft) => {
    if (!acc[nft.owner.address]) {
      acc[nft.owner.address] = []
    }

    acc[nft.owner.address].push(nft)

    return acc
  }, {} as { [wallet: string]: NFT[] })
}
