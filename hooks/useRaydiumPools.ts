import { getMintMetadata } from '@components/instructions/programs/splToken'
import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'
import { fetchPoolKeysForBaseMint } from '@utils/instructions/Raydium/helpers'
import { useCallback, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

type Pools = {
  [name in string]: {
    poolKeys: LiquidityPoolKeysV4
    tokenAName: string
    tokenBName: string
  }
}

// You may provide mints to limit the amount of loaded pools
// Do not load anything if filter is unset
export default function useRaydiumPools(
  filterPoolsByBaseMint?: PublicKey
): Pools | null | undefined {
  const connection = useWalletStore((s) => s.connection.current)

  const [pools, setPools] = useState<Pools | null>()

  const fetchPools = useCallback(async () => {
    if (!filterPoolsByBaseMint) return

    // Load pool info (list of keys by pool)
    const poolsInfo = await fetchPoolKeysForBaseMint(
      connection,
      filterPoolsByBaseMint
    )

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

    // 5 - Match poolInfo and the name
    const pools = poolsInfo.reduce((pools, poolInfo) => {
      const poolName = `${mintNames[poolInfo.baseMint.toBase58()]}-${
        mintNames[poolInfo.quoteMint.toBase58()]
      }`

      pools[poolName] = {
        poolKeys: poolInfo,
        tokenAName: mintNames[poolInfo.baseMint.toBase58()],
        tokenBName: mintNames[poolInfo.quoteMint.toBase58()],
      }

      return pools
    }, {} as Pools)

    setPools(pools)
  }, [connection, filterPoolsByBaseMint])

  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  return pools
}
