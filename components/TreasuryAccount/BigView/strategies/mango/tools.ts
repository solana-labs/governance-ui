import tokenService from '@utils/services/token'
import axios from 'axios'
import { TreasuryStrategy } from '../../types/types'

export const mangoTokens = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  SOL: 'solana',
  SRM: 'serum',
  USDC: 'usd-coin',
  USDT: 'tether',
  MNGO: 'mango-markets',
  RAY: 'raydium',
  COPE: 'cope',
  FTT: 'ftx-token',
  MSOL: 'msol',
  BNB: 'binance-coin',
  AVAX: 'avalanche',
  LUNA: 'terra-luna',
}
export const MANGO = 'MANGO'
export const MANGO_MINT = 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'

export const mangoTokensList = Object.keys(mangoTokens).map((x) => {
  return {
    name: x,
    val: x,
  }
})

const endpoint =
  'https://mango-stats-v3.herokuapp.com/spot?mangoGroup=mainnet.1'

// Very inefficient
function findClosestToDate(values, date) {
  let min = values[0]
  for (const val of values) {
    const valDate = new Date(val.time).getTime()
    const minDate = new Date(min.time).getTime()
    if (Math.abs(valDate - date) < Math.abs(minDate - date)) {
      min = val
    }
  }
  if (Math.abs(new Date(min.time).getTime() - date) > 24 * 3600 * 1000) {
    return {
      totalDeposits: 0,
      totalBorrows: 0,
    }
  }
  return min
}

export async function tvl(timestamp) {
  const balances: TreasuryStrategy[] = []
  const stats = await axios.get(endpoint)
  const date = new Date(timestamp * 1000).getTime()
  Object.entries(mangoTokens).map(([mangoId, mangoTokens]) => {
    const assetDeposits = stats.data.filter((s) => s.name === mangoId)
    if (assetDeposits.length > 0) {
      const info = tokenService.getTokenInfoFromCoingeckoId(mangoTokens)
      const closestVal = findClosestToDate(assetDeposits, date)
      balances.push({
        liquidity:
          (closestVal.totalDeposits - closestVal.totalBorrows) *
          closestVal.baseOraclePrice,
        symbol: info?.symbol || mangoId,
        apy: `${(
          Math.pow(1 + closestVal.depositRate / 100000, 100000) - 1
        ).toFixed(2)}%`,
        protocol: MANGO,
        mint: info?.address || '',
        tokenImgSrc: info?.logoURI || '',
        strategy: 'Deposit',
      })
    }
  })
  return balances
}
