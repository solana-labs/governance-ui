import { getMintMetadata } from '@components/instructions/programs/splToken'
import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'
import { fetchPoolKeysForMint } from '@utils/instructions/Raydium/helpers'
import { useCallback, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

// If Side is reverse, quote is tokenB and base tokenA
export type Side = 'normal' | 'reverse'

export type Pools = {
  [name in string]: {
    poolKeys: LiquidityPoolKeysV4
    tokenIn: {
      mint: PublicKey
      name: string
      decimals: number
    }
    tokenOut: {
      mint: PublicKey
      name: string
      decimals: number
    }
    side: Side
  }
}

// Gives the mint to look pools for
// Do not load anything if mint is unset
//
// Consider the given mint to always be the mint to swap with
export default function useRaydiumPoolsForSwap(
  filterPoolsByMint?: PublicKey
): Pools | null | undefined {
  const connection = useWalletStore((s) => s.connection.current)

  const [pools, setPools] = useState<Pools | null>()

  const fetchPools = useCallback(async () => {
    if (!filterPoolsByMint) return

    // Load pool info (list of keys by pool)
    const poolsInfo = await fetchPoolKeysForMint(connection, filterPoolsByMint)

    // 2 - Extract the mints used to generate the pool name
    const mints: PublicKey[] = Array.from(
      poolsInfo
        .reduce((mints, { baseMint, quoteMint }) => {
          mints.add(baseMint.toBase58())
          mints.add(quoteMint.toBase58())

          return mints
        }, new Set())
        .keys()
    ).map((mint: string) => new PublicKey(mint))

    // 3 - Load mint metadata to try and get the Symbol behind the mints
    const mintInfo = await Promise.all(
      mints.map((mint) => getMintMetadata(mint))
    )

    // 4 - Map the mint and the name for easy access
    const mintNames = mints.reduce(
      (mintsNames, mint, index) => {
        mintsNames[mint.toBase58()] = mintInfo[index]?.name ?? mint.toBase58()

        return mintsNames
      },
      {} as {
        [key in string]: string
      }
    )

    // 5 - Match poolInfo and the name and add useful info for the swap
    const pools = poolsInfo.reduce((pools, poolInfo) => {
      const poolName = `${mintNames[poolInfo.baseMint.toBase58()]}-${
        mintNames[poolInfo.quoteMint.toBase58()]
      }`

      if (filterPoolsByMint.equals(poolInfo.baseMint)) {
        pools[poolName] = {
          poolKeys: poolInfo,
          tokenIn: {
            mint: poolInfo.baseMint,
            name: mintNames[poolInfo.baseMint.toBase58()],
            decimals: poolInfo.baseDecimals,
          },
          tokenOut: {
            mint: poolInfo.quoteMint,
            name: mintNames[poolInfo.quoteMint.toBase58()],
            decimals: poolInfo.quoteDecimals,
          },
          side: 'normal',
        }

        return pools
      }

      pools[poolName] = {
        poolKeys: poolInfo,
        tokenIn: {
          mint: poolInfo.quoteMint,
          name: mintNames[poolInfo.quoteMint.toBase58()],
          decimals: poolInfo.quoteDecimals,
        },
        tokenOut: {
          mint: poolInfo.baseMint,
          name: mintNames[poolInfo.baseMint.toBase58()],
          decimals: poolInfo.baseDecimals,
        },
        side: 'reverse',
      }

      return pools
    }, {} as Pools)

    setPools(pools)
  }, [connection, filterPoolsByMint])

  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  return pools
}
