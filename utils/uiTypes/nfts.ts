import { AccountInfo } from '@solana/spl-token'
import { TokenProgramAccount } from '@utils/tokens'

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
}
