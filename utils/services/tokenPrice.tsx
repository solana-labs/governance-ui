import axios from 'axios'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { mergeDeepRight } from 'ramda'

import { notify } from '@utils/notifications'
import { WSOL_MINT } from '@components/instructions/tools'
import overrides from 'public/realms/token-overrides.json'
import { MAINNET_USDC_MINT } from '@foresight-tmp/foresight-sdk/dist/consts'

//this service provide prices it is not recommended to get anything more from here besides token name or price.
//decimals from metadata can be different from the realm on chain one
const endpoint = 'https://price.jup.ag/v4/price'

type Price = {
  id: string
  mintSymbol: string
  price: number
  vsToken: string
  vsTokenSymbol: string
}

export type TokenInfoWithoutDecimals = Omit<TokenInfo, 'decimals'>

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
    console.log(mintAddresses)
    if (mintAddresses.length) {
      const mintAddressesWithSol = [...mintAddresses, WSOL_MINT]
      const symbols = mintAddressesWithSol.join(',')
      try {
        const USDC_MINT = MAINNET_USDC_MINT.toBase58()
        const response = await axios.get(`${endpoint}?ids=${symbols}`)
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
        if (!this._tokenPriceToUSDlist[USDC_MINT]) {
          this._tokenPriceToUSDlist[USDC_MINT] = {
            id: USDC_MINT,
            mintSymbol: 'USDC',
            price: 1,
            vsToken: USDC_MINT,
            vsTokenSymbol: 'USDC',
          }
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
