import axios from 'axios'
const coingeckoPriceEndpoint = 'https://api.coingecko.com/api/v3/simple/price'

interface Extensions {
  coingeckoId: string
}

interface TokenRerecord {
  extensions: Extensions
  symbol: string
}

class PriceService {
  tokenList: TokenRerecord[]
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
  async getTokenPriceToUSD(symbol: string) {
    const tokenListRecord = this.tokenList.find((x) => x.symbol === symbol)
    if (typeof tokenListRecord !== 'undefined') {
      const coingeckoId = tokenListRecord.extensions.coingeckoId
      if (!this.tokenPriceToUSDlist[coingeckoId]) {
        const priceToUsdResponse = await axios.get(
          `${coingeckoPriceEndpoint}?ids=${coingeckoId}&vs_currencies=usd`
        )
        const priceToUsd = priceToUsdResponse.data
        this.tokenPriceToUSDlist = {
          ...this.tokenPriceToUSDlist,
          ...priceToUsd,
        }
        return priceToUsd[coingeckoId]['usd']
      } else {
        return this.tokenPriceToUSDlist[coingeckoId]['usd']
      }
    } else {
      return 0
    }
  }
}

const priceService = new PriceService()

export default priceService
