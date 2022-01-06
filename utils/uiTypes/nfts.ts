interface NFTFiles {
  type: string
  uri: string
}
interface NFTProperties {
  category: string
  files: NFTFiles[]
}
export interface NFTData {
  image: string
  name: string
  description: string
  properties: NFTProperties
}
export interface NFTWithMint {
  val: NFTData
  mint: string
}
