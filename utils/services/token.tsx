import axios from 'axios'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { notify } from '@utils/notifications'
import { WSOL_MINT } from '@components/instructions/tools'
import { MANGO_MINT } from 'Strategies/protocols/mango/tools'
const coingeckoPriceEndpoint = 'https://api.coingecko.com/api/v3/simple/price'

class TokenService {
  _tokenList: TokenInfo[]
  _tokenPriceToUSDlist: any
  constructor() {
    this._tokenList = []
    this._tokenPriceToUSDlist = {}
  }
  async fetchSolanaTokenList() {
    try {
      const tokens = await new TokenListProvider().resolve()
      const tokenList = tokens.filterByClusterSlug('mainnet-beta').getList()
      if (tokenList && tokenList.length) {
        this._tokenList = tokenList
      }
    } catch (e) {
      console.log(e)
      notify({
        type: 'error',
        message: 'unable to fetch token list',
      })
    }
  }
  async fetchTokenPrices(mintAddresses: string[]) {
    if (mintAddresses.length) {
      const mintAddressesWithSol = [...mintAddresses, WSOL_MINT, MANGO_MINT]
      const tokenListRecords = this._tokenList?.filter((x) =>
        mintAddressesWithSol.includes(x.address)
      )
      const coingeckoIds = tokenListRecords
        .map((x) => x.extensions?.coingeckoId)
        .join(',')
      try {
        const priceToUsdResponse = await axios.get(
          `${coingeckoPriceEndpoint}?ids=${coingeckoIds}&vs_currencies=usd`
        )
        const priceToUsd = priceToUsdResponse.data
        this._tokenPriceToUSDlist = {
          ...this._tokenPriceToUSDlist,
          ...priceToUsd,
        }
        return priceToUsd
      } catch (e) {
        notify({
          type: 'error',
          message: 'unable to fetch token prices',
        })
        return {}
      }
    }
    return {}
  }
  getUSDTokenPrice(mintAddress: string): number {
    if (mintAddress) {
      const tokenListRecord = this._tokenList?.find(
        (x) => x.address === mintAddress
      )
      const coingeckoId = tokenListRecord?.extensions?.coingeckoId
      if (tokenListRecord && coingeckoId) {
        return this._tokenPriceToUSDlist[coingeckoId]?.usd || 0
      }
      return 0
    }

    return 0
  }
  getTokenInfo(mintAddress: string) {
    const tokenListRecord = this._tokenList?.find(
      (x) => x.address === mintAddress
    )
    return tokenListRecord
  }
  getTokenInfoFromCoingeckoId(coingeckoId: string) {
    const tokenListRecord = this._tokenList?.find(
      (x) => x.extensions?.coingeckoId === coingeckoId
    )
    return tokenListRecord
  }
}

const tokenService = new TokenService()

export default tokenService
