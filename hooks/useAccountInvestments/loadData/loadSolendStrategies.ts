import type { BigNumber } from 'bignumber.js'
import {
  cTokenExchangeRate,
  getReserveData,
  SOLEND,
} from 'Strategies/protocols/solend'
import { TreasuryStrategy, SolendStrategy } from 'Strategies/types/types'
import { Wallet } from '@models/treasury/Wallet'
import { Token } from '@models/treasury/Asset'

function isSolendStrategy(
  strategy: TreasuryStrategy
): strategy is SolendStrategy {
  return strategy.protocolName === SOLEND
}

export default async function loadSolendStrategies(args: {
  strategies: TreasuryStrategy[]
  strategyMintAddress: string
  tokenAmount: BigNumber
  wallet?: Wallet
}): Promise<(TreasuryStrategy & { investedAmount: number })[]> {
  const solendStrategy: SolendStrategy | undefined = args.strategies.filter(
    (arg) =>
      isSolendStrategy(arg) && arg.handledMint === args.strategyMintAddress
  )[0] as SolendStrategy

  const reserveStats = solendStrategy
    ? await getReserveData(
        solendStrategy.reserves.map((strat) => strat.reserveAddress) ?? []
      )
    : []

  return (
    solendStrategy?.reserves.map((res) => {
      const stat = reserveStats.find(
        (stat) => stat.reserve.lendingMarket === res.marketAddress
      )!

      const cTokenBalance =
        (args.wallet?.assets.find(
          (ass: Token) => ass.mintAddress === res.collateralMintAddress
        ) as Token)?.count.toNumber() ?? 0

      const a = {
        ...solendStrategy,
        apy: `${res.supplyApy.toFixed(2)}%`,
        protocolName: solendStrategy.protocolName,
        strategySubtext: `${res.marketName} Pool`,
        investedAmount: cTokenBalance * cTokenExchangeRate(stat),
      }

      return {
        ...solendStrategy,
        apy: `${res.supplyApy.toFixed(2)}%`,
        protocolName: solendStrategy.protocolName,
        strategySubtext: `${res.marketName} Pool`,
        investedAmount: cTokenBalance * cTokenExchangeRate(stat),
      }
    }) ?? []
  )
}
