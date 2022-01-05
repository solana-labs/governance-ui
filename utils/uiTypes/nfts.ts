export interface NFTData {
  image: string
  name: string
  description: string
}
export interface NFTWithMint {
  val: NFTData
  mint: string
}
