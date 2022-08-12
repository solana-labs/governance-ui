import type { BigNumber } from 'bignumber.js'
import type { Connection } from '@solana/web3.js'
import type { MangoAccount } from '@blockworks-foundation/mango-client'

import { MarketStore } from 'Strategies/store/marketStore'
import { TreasuryStrategy } from 'Strategies/types/types'

import loadMangoStrategies from './loadMangoStrategies'
import loadSolendStrategies from './loadSolendStrategies'
import loadEverlendStrategies from './loadEverlendStrategies'

export default function loadData(args: {
  connection: Connection
  loadMango?: boolean
  loadSolend?: boolean
  loadEverlend?: boolean
  mangoAccounts: MangoAccount[]
  marketStore: MarketStore
  strategies: TreasuryStrategy[]
  strategyMintAddress: string
  tokenAddress: string
  tokenAmount: BigNumber
}): Promise<(TreasuryStrategy & { investedAmount?: number })[]> {
  return Promise.all([
    args.loadMango ? loadMangoStrategies(args).catch(() => []) : [],
    args.loadSolend ? loadSolendStrategies(args).catch(() => []) : [],
    args.loadEverlend ? loadEverlendStrategies(args).catch(() => []) : [],
  ]).then((results) =>
    results
      .flat()
      .filter((strat) => strat.handledMint === args.strategyMintAddress)
  )
}
