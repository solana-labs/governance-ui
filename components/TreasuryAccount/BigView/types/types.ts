export interface TreasuryStrategy {
  liquidity: number
  symbol: string
  apy: string
  protocol: string
  mint: string
  tokenImgSrc: string
  strategy: string
}

export interface NameVal {
  name: string
  val: string | null
}
