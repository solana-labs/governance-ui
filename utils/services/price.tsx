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
  async fetchTokenPrices(symbols: string[]) {
    const tokenListRecords = this.tokenList.filter((x) =>
      symbols.includes(x.symbol)
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
  getTokenPrice(symbol: string): number {
    const tokenListRecord = this.tokenList.find((x) => x.symbol === symbol)
    if (tokenListRecord) {
      return this.tokenPriceToUSDlist[tokenListRecord?.extensions.coingeckoId][
        'usd'
      ]
    }
    return 0
  }
}

const priceService = new PriceService()

export default priceService
