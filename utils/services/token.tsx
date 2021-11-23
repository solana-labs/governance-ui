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
    this.tokenList = response.data.tokens
  }
  //best to run as soon as you get all tokens symbols that dao holds.
  async fetchTokenPrices(tokenNames: string[]) {
    if (!this.tokenList.length) {
      await this.fetchSolanaTokenList()
    }
    const tokenListRecords = this.tokenList.filter((x) =>
      tokenNames.includes(x.symbol)
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
  getUSDTokenPrice(tokenName: string): number {
    if (tokenName) {
      const tokenListRecord = this.tokenList.find((x) => x.symbol === tokenName)
      if (tokenListRecord) {
        return this.tokenPriceToUSDlist[tokenListRecord?.extensions.coingeckoId]
          ?.usd
      }
      return 0
    }

    return 0
  }
  getTokenInfo(symbol: string) {
    const tokenListRecord = this.tokenList.find((x) => x.symbol === symbol)
    return tokenListRecord
  }
}

const tokenService = new TokenService()

export default tokenService
