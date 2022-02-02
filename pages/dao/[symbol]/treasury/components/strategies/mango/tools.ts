import tokenService from '@utils/services/token'
import axios from 'axios'
import { TreasuryStrategy } from '../../..'

// Precision for our mango group token
export const tokenPrecision = {
  BTC: 4,
  ETH: 3,
  MNGO: 2,
  SOL: 2,
  SRM: 2,
  RAY: 3,
  COPE: 2,
  FTT: 3,
  ADA: 2,
  MSOL: 2,
  BNB: 3,
  AVAX: 2,
  USDC: 2,
  USDT: 2,
}

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

const coingeckoIds = {
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

export async function tvl(timestamp) {
  const balances: TreasuryStrategy[] = []
  const stats = await axios.get(endpoint)
  const date = new Date(timestamp * 1000).getTime()
  Object.entries(coingeckoIds).map(([mangoId, coingeckoId]) => {
    const assetDeposits = stats.data.filter((s) => s.name === mangoId)
    if (assetDeposits.length > 0) {
      const info = tokenService.getTokenInfoFromCoingeckoId(coingeckoId)
      const closestVal = findClosestToDate(assetDeposits, date)
      const startValue = 100
      balances.push({
        liquidity: closestVal.totalDeposits - closestVal.totalBorrows,
        symbol: info?.symbol || mangoId,
        apy: `${(
          ((startValue * Math.pow(1 + closestVal.depositRate / 365, 365 * 7) -
            startValue) /
            100) *
          100
        ).toFixed(2)}%`,
        protocol: 'MANGO',
        mint: info?.address || '',
        tokenImgSrc: info?.logoURI || '',
      })
    }
  })
  return balances
}
