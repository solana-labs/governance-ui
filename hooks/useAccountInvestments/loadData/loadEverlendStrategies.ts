import { Connection, PublicKey } from '@solana/web3.js'
import { findAssociatedTokenAccount } from '@everlend/common'

import { EVERLEND } from 'Strategies/protocols/everlend/tools'
import { TreasuryStrategy, EverlendStrategy } from 'Strategies/types/types'

function isEverlendStrategy(
  strategy: TreasuryStrategy
): strategy is EverlendStrategy {
  return strategy.protocolName === EVERLEND
}

export default async function loadEverlendStrategies(args: {
  connection: Connection
  strategies: TreasuryStrategy[]
  tokenAddress: string
}): Promise<(TreasuryStrategy & { investedAmount: number })[]> {
  const strategy: EverlendStrategy | undefined = args.strategies.filter(
    isEverlendStrategy
  )[0]
  const tokenMintAta = strategy
    ? await findAssociatedTokenAccount(
        new PublicKey(args.tokenAddress),
        new PublicKey(strategy.poolMint)
      )
    : undefined

  const tokenMintATABalance = tokenMintAta
    ? await args.connection.getTokenAccountBalance(tokenMintAta)
    : undefined

  if (tokenMintATABalance?.value.uiAmount) {
    return [
      {
        ...strategy,
        investedAmount: Number(tokenMintATABalance.value.uiAmount),
      },
    ]
  }

  return []
}
