import { MangoClient } from '@blockworks-foundation/mango-client'
import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useMarketStore, { MarketStore } from 'Strategies/store/marketStore'

export default function useMarket() {
  const { connection } = useWalletStore()
  const market = useMarketStore((state) => state)
  const { groupConfig, marketConfig, set } = market
  useEffect(() => {
    const pageLoad = async () => {
      // fetch market on page load

      const client = new MangoClient(
        connection.current,
        groupConfig.mangoProgramId
      )
      const group = await client.getMangoGroup(groupConfig.publicKey)

      set((s: MarketStore) => {
        s.client = client
        s.group = group
        s.info = group.perpMarkets[marketConfig.marketIndex]
      })

      const [perpMarket] = await Promise.all([
        group.loadPerpMarket(
          connection.current,
          marketConfig.marketIndex,
          marketConfig.baseDecimals,
          marketConfig.quoteDecimals
        ),
        group.loadRootBanks(connection.current),
      ])

      set((s: MarketStore) => {
        s.market = perpMarket
      })

      const cache = await group.loadCache(connection.current)
      const indexPrice = group.getPriceUi(marketConfig.marketIndex, cache)
      set((s: MarketStore) => {
        s.cache = cache
        s.indexPrice = indexPrice
      })
    }
    if (groupConfig && marketConfig) {
      pageLoad()
    }
  }, [groupConfig, marketConfig, set])

  return market
}
