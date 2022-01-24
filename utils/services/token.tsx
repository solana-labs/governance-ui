import axios from 'axios'
const coingeckoPriceEndpoint = 'https://api.coingecko.com/api/v3/simple/price'

interface Extensions {
  coingeckoId: string
}

export interface TokenRecord {
  extensions: Extensions
  symbol: string
  logoURI: string
  name: string
  address: string
}

class TokenService {
  tokenList: TokenRecord[]
  tokenPriceToUSDlist: any
  constructor() {
    this.tokenList = []
    this.tokenPriceToUSDlist = {}
    this.fetchSolanaTokenList()
  }
  async fetchSolanaTokenList() {
    const response = await axios.get(
      'https://token-list.solana.com/solana.tokenlist.json'
    )
    this.tokenList = response.data.tokens ?? []
  }
  async fetchTokenPrices(mintAddresses: string[]) {
    if (!this.tokenList.length) {
      await this.fetchSolanaTokenList()
    }
    const tokenListRecords = this.tokenList.filter((x) =>
      mintAddresses.includes(x.address)
    )
    const coingeckoIds = tokenListRecords
      .map((x) => x.extensions.coingeckoId)
      .join(',')
    const priceToUsdResponse = await axios.get(
      `${coingeckoPriceEndpoint}?ids=${coingeckoIds}&vs_currencies=usd`
    )
    const priceToUsd = priceToUsdResponse.data
    this.tokenPriceToUSDlist = { ...this.tokenPriceToUSDlist, ...priceToUsd }
    return priceToUsd
  }
  getUSDTokenPrice(mintAddress: string): number {
    if (mintAddress) {
      const tokenListRecord = this.tokenList.find(
        (x) => x.address === mintAddress
      )
      const coingeckoId = tokenListRecord?.extensions.coingeckoId
      if (tokenListRecord && coingeckoId) {
        return this.tokenPriceToUSDlist[coingeckoId]?.usd || 0
      }
      return 0
    }

    return 0
  }
  getTokenInfo(mintAddress: string) {
    const tokenListRecord = this.tokenList.find(
      (x) => x.address === mintAddress
    )
    return tokenListRecord
  }
}

const tokenService = new TokenService()

export default tokenService
