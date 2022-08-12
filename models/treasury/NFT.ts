export interface NFT {
  address: string
  collection?: null | {
    address: string
    name: string
    nftCount?: number
    image: string
  }
  image: string
  name: string
  owner: {
    address: string
  }
}
