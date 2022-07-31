interface NFTFiles {
  type: string
  uri: string
}
interface NFTProperties {
  category: string
  files: NFTFiles[]
}

interface NFTCreator {
  verified: boolean
  address: string
}

interface NFTCollectionProperties {
  mintAddress: string
  creators: NFTCreator
}
export interface NFTWithMint {
  image: string
  name: string
  description: string
  properties: NFTProperties
  collection: NFTCollectionProperties
  mintAddress: string
  address: string
  tokenAccountAddress: string
}
