import type { BigNumber } from 'bignumber.js'

import {
  cTokenExchangeRate,
  getReserveData,
  SOLEND,
} from 'Strategies/protocols/solend'
import { TreasuryStrategy, SolendStrategy } from 'Strategies/types/types'

function isSolendStrategy(
  strategy: TreasuryStrategy
): strategy is SolendStrategy {
  return strategy.protocolName === SOLEND
}

export default async function loadSolendStrategies(args: {
  strategies: TreasuryStrategy[]
  strategyMintAddress: string
  tokenAmount: BigNumber
}): Promise<(TreasuryStrategy & { investedAmount: number })[]> {
  const solendStrategy: SolendStrategy | undefined = args.strategies.filter(
    isSolendStrategy
  )[0]
  const reserve = solendStrategy
    ? solendStrategy.reserves.find(
        (reserve) =>
          reserve.mintAddress === args.strategyMintAddress &&
          reserve.collateralMintAddress === args.strategyMintAddress
      )
    : undefined

  const reserveStats = reserve
    ? await getReserveData([reserve.reserveAddress])
    : []

  if (solendStrategy && reserve && reserveStats.length) {
    const stat = reserveStats.find(
      (stat) => stat.reserve.lendingMarket === reserve.marketAddress
    )

    if (stat) {
      return [
        {
          ...solendStrategy,
          apy: `${reserve.supplyApy.toFixed(2)}%`,
          protocolName: solendStrategy.protocolName,
          strategySubtext: `${reserve.marketName} Pool`,
          investedAmount:
            (args.tokenAmount.toNumber() * cTokenExchangeRate(stat)) /
            10 ** reserve.decimals,
        },
      ]
    }
  }

  return []
}
