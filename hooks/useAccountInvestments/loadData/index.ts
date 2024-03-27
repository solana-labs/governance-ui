import type { BigNumber } from 'bignumber.js'
import type { Connection } from '@solana/web3.js'
import { TreasuryStrategy } from 'Strategies/types/types'
import loadSolendStrategies from './loadSolendStrategies'
import { PublicKey } from '@solana/web3.js'
import { Wallet } from '@models/treasury/Wallet'

export default function loadData(args: {
  connection: Connection
  loadSolend?: boolean
  strategies: TreasuryStrategy[]
  strategyMintAddress: string
  tokenAddress: string
  owner?: PublicKey
  wallet?: Wallet
  tokenAmount: BigNumber
}): Promise<(TreasuryStrategy & { investedAmount?: number })[]> {
  return Promise.all([
    args.loadSolend ? loadSolendStrategies(args).catch(() => []) : [],
  ]).then((results) =>
    results
      .flat()
      .filter((strat) => strat.handledMint === args.strategyMintAddress)
  )
}
