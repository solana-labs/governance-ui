import axios from 'axios'
import { mergeDeepRight } from 'ramda'

import { notify } from '@utils/notifications'
import { WSOL_MINT } from '@components/instructions/tools'
import overrides from 'public/realms/token-overrides.json'
import { Price, TokenInfo } from './types'
import { chunks } from '@utils/helpers'
import { USDC_MINT } from '@blockworks-foundation/mango-v4'

//this service provide prices it is not recommended to get anything more from here besides token name or price.
//decimals from metadata can be different from the realm on chain one
const priceEndpoint = 'https://price.jup.ag/v4/price'
const tokenListUrl = 'https://token.jup.ag/strict'

export type TokenInfoWithoutDecimals = Omit<TokenInfo, 'decimals'>

/** @deprecated */
class TokenPriceService {
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
      const tokens = await axios.get(tokenListUrl)
      const tokenList = tokens.data as TokenInfo[]
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
      //can query only 100 at once
      const mintAddressesWithSol = chunks([...mintAddresses, WSOL_MINT], 100)
      for (const mintChunk of mintAddressesWithSol) {
        const symbols = mintChunk.join(',')
        try {
          const response = await axios.get(`${priceEndpoint}?ids=${symbols}`)
          const priceToUsd: Price[] = response?.data?.data
            ? Object.values(response.data.data)
            : []
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
      const USDC_MINT_BASE = USDC_MINT.toBase58()
      if (!this._tokenPriceToUSDlist[USDC_MINT_BASE]) {
        this._tokenPriceToUSDlist[USDC_MINT_BASE] = {
          id: USDC_MINT_BASE,
          mintSymbol: 'USDC',
          price: 1,
          vsToken: USDC_MINT_BASE,
          vsTokenSymbol: 'USDC',
        }
      }

      //override chai price if its broken
      const chaiMint = '3jsFX1tx2Z8ewmamiwSU851GzyzM2DJMq7KWW5DM8Py3'
      const chaiData = this._tokenPriceToUSDlist[chaiMint]

      if (chaiData?.price && (chaiData.price > 1.3 || chaiData.price < 0.9)) {
        this._tokenPriceToUSDlist[chaiMint] = {
          ...chaiData,
          price: 1,
        }
      }
    }
  }
  /**
   * @deprecated
   * seriously do not use this. use fetchJupiterPrice
   */
  getUSDTokenPrice(mintAddress: string): number {
    return mintAddress ? this._tokenPriceToUSDlist[mintAddress]?.price || 0 : 0
  }
  /**
   * For decimals use on chain tryGetMint
   */
  getTokenInfo(mintAddress: string): TokenInfoWithoutDecimals | undefined {
    const tokenListRecord = this._tokenList?.find(
      (x) => x.address === mintAddress
    )
    return tokenListRecord
  }
  /**
   * For decimals use on chain tryGetMint
   */
  getTokenInfoFromCoingeckoId(
    coingeckoId: string
  ): TokenInfoWithoutDecimals | undefined {
    const tokenListRecord = this._tokenList?.find(
      (x) => x.extensions?.coingeckoId === coingeckoId
    )
    return tokenListRecord
  }
}

const tokenPriceService = new TokenPriceService()

export default tokenPriceService
