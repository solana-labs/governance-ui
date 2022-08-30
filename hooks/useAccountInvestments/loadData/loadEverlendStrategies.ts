import { Connection, PublicKey } from '@solana/web3.js'
import { findAssociatedTokenAccount } from '@everlend/common'

import {
  calcUserTokenBalanceByPoolToken,
  EVERLEND,
} from 'Strategies/protocols/everlend/tools'
import { TreasuryStrategy, EverlendStrategy } from 'Strategies/types/types'

function isEverlendStrategy(
  strategy: TreasuryStrategy
): strategy is EverlendStrategy {
  return strategy.protocolName === EVERLEND
}

const notNull = <TValue>(value: TValue | null): value is TValue => {
  return value !== null
}

export default async function loadEverlendStrategies(args: {
  connection: Connection
  strategies: TreasuryStrategy[]
  tokenAddress: string
  owner?: PublicKey
}): Promise<(EverlendStrategy & { investedAmount: number })[]> {
  const strategys: (EverlendStrategy | undefined)[] = args.strategies.filter(
    isEverlendStrategy
  )

  if (!strategys) return []

  const loadedStratagies = await Promise.all(
    strategys.map(async (strategy) => {
      const tokenMintAta =
        strategy && args.owner
          ? await findAssociatedTokenAccount(
              args.owner,
              new PublicKey(strategy.poolMint)
            )
          : undefined

      let tokenMintATABalance = 0
      console.log(args)

      try {
        const tokenMintATABalanceFetched = tokenMintAta
          ? await args.connection.getTokenAccountBalance(tokenMintAta)
          : 0
        if (tokenMintATABalanceFetched) {
          tokenMintATABalance = calcUserTokenBalanceByPoolToken(
            Number(tokenMintATABalanceFetched.value.uiAmount),
            strategy?.decimals,
            Number(strategy?.rateEToken),
            false
          )
        }
      } catch (e) {
        tokenMintATABalance = 0
      }

      return tokenMintATABalance
        ? { ...strategy, investedAmount: tokenMintATABalance }
        : null
    })
  )

  // @ts-ignore
  return loadedStratagies.filter(notNull)
}
