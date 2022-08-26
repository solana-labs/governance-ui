import { PublicKey } from '@solana/web3.js'
import { MangoAccount } from '@blockworks-foundation/mango-client'

import {
  calculateAllDepositsInMangoAccountsForMint,
  MANGO,
} from 'Strategies/protocols/mango/tools'
import { MarketStore } from 'Strategies/store/marketStore'
import { TreasuryStrategy } from 'Strategies/types/types'

export default async function loadMangoStrategies(args: {
  mangoAccounts: MangoAccount[]
  marketStore: MarketStore
  strategies: TreasuryStrategy[]
  strategyMintAddress: string
}): Promise<TreasuryStrategy[]> {
  const strategyMintPK = new PublicKey(args.strategyMintAddress)

  const currentPositions = calculateAllDepositsInMangoAccountsForMint(
    args.mangoAccounts,
    strategyMintPK,
    args.marketStore
  )

  if (currentPositions > 0) {
    return args.strategies
      .map((invest) => ({ ...invest, investedAmount: currentPositions }))
      .filter((x) => x.protocolName === MANGO)
  }

  return []
}
