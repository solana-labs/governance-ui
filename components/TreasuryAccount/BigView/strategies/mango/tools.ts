import { BN } from '@project-serum/anchor'
import tokenService from '@utils/services/token'
import axios from 'axios'
import { TreasuryStrategy } from '../../types/types'

//Symbol, coingeckoId
export const tokenList = {
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
export const MANGO = 'Mango'
export const MANGO_MINT = 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'

export const tokenListFilter = Object.keys(tokenList).map((x) => {
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

//method to fetch mango strategies
export async function tvl(timestamp) {
  const protocolInfo = await tokenService.getTokenInfo(MANGO_MINT)
  const balances: TreasuryStrategy[] = []
  const stats = await axios.get(endpoint)
  const date = new Date(timestamp * 1000).getTime()
  Object.entries(tokenList).map(([mangoId, mangoTokens]) => {
    const assetDeposits = stats.data.filter((s) => s.name === mangoId)
    if (assetDeposits.length > 0) {
      const info = tokenService.getTokenInfoFromCoingeckoId(mangoTokens)
      const closestVal = findClosestToDate(assetDeposits, date)
      balances.push({
        liquidity:
          (closestVal.totalDeposits - closestVal.totalBorrows) *
          closestVal.baseOraclePrice,
        handledTokenSymbol: info?.symbol || mangoId,
        apy: `${(
          Math.pow(1 + closestVal.depositRate / 100000, 100000) - 1
        ).toFixed(2)}%`,
        protocolName: MANGO,
        protocolSymbol: protocolInfo?.symbol || '',
        handledMint: info?.address || '',
        handledTokenImgSrc: info?.logoURI || '',
        protocolLogoSrc: protocolInfo?.logoURI || '',
        strategyName: 'Deposit',
        //TODO handle getting current position
        currentPosition: new BN(0),
        strategyDescription: 'Description',
        isGenericItem: true,
        handleDeposit: HandleMangoDeposit,
      })
    }
  })
  return balances
}

const HandleMangoDeposit = async (mint, amount) => {
  console.log(mint, amount)
}
