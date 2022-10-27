import axios from 'axios'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { mergeDeepRight } from 'ramda'

import { notify } from '@utils/notifications'
import { WSOL_MINT } from '@components/instructions/tools'
import { MANGO_MINT } from 'Strategies/protocols/mango/tools'
import overrides from 'public/realms/token-overrides.json'

const endpoint = 'https://price.jup.ag/v1/price'

type Price = {
  id: string
  mintSymbol: string
  price: number
  vsToken: string
  vsTokenSymbol: string
}

class TokenService {
  _tokenList: TokenInfo[]
  _tokenPriceToUSDlist: {
    [mintAddress: string]: Price
  }
  constructor() {
    this._tokenList = []
    this._tokenPriceToUSDlist = {}
  }
  async fetchSolanaTokenList() {
    try {
      const tokens = await new TokenListProvider().resolve()
      const tokenList = tokens.filterByClusterSlug('mainnet-beta').getList()
      if (tokenList && tokenList.length) {
        this._tokenList = tokenList.map((token) => {
          const override = overrides[token.address]

          if (override) {
            return mergeDeepRight(token, override)
          }

          return token
        })
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
      const symbols = tokenListRecords.map((x) => x.symbol).join(',')
      try {
        const response = await axios.get(`${endpoint}?id=${symbols}`)
        const priceToUsd: Price[] =
          response?.data?.data?.filter((x) => x.id) || []
        const keyValue = Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(priceToUsd).map(([key, val]) => [val.id, val])
        )
        this._tokenPriceToUSDlist = {
          ...this._tokenPriceToUSDlist,
          ...keyValue,
        }
      } catch (e) {
        notify({
          type: 'error',
          message: 'unable to fetch token prices',
        })
      }
    }
  }
  getUSDTokenPrice(mintAddress: string): number {
    return mintAddress ? this._tokenPriceToUSDlist[mintAddress]?.price || 0 : 0
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
