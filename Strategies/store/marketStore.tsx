import create, { State } from 'zustand'
import {
  Config,
  getMarketIndexBySymbol,
  GroupConfig,
  MangoCache,
  MangoClient,
  MangoGroup,
  PerpMarket,
  PerpMarketConfig,
  PerpMarketInfo,
  RootBank,
  TokenInfo,
} from '@blockworks-foundation/mango-client'
import { ConnectionContext } from '@utils/connection'

export interface MarketStore extends State {
  groupConfig?: GroupConfig
  marketConfig?: PerpMarketConfig
  cache?: MangoCache
  client?: MangoClient
  group?: MangoGroup
  info?: PerpMarketInfo
  market?: PerpMarket
  indexPrice?: number
  quoteCurrency?: TokenInfo
  quoteRootBank?: RootBank
  loadMarket: (connection: ConnectionContext, cluster: string) => void
}
const useMarketStore = create<MarketStore>((set, _get) => ({
  loadMarket: async (connection: ConnectionContext, cluster: string) => {
    const GROUP = cluster === 'devnet' ? 'devnet.2' : 'mainnet.1'
    const groupConfig = Config.ids().getGroupWithName(GROUP)!
    const DEFAULT_MARKET = 'SOL'
    const DEFAULT_MARKET_INDEX = getMarketIndexBySymbol(
      groupConfig,
      DEFAULT_MARKET
    )
    const marketConfig = groupConfig?.perpMarkets[DEFAULT_MARKET_INDEX]
    const client = new MangoClient(
      connection.current,
      groupConfig.mangoProgramId
    )
    const group = await client.getMangoGroup(groupConfig.publicKey)

    const [perpMarket] = await Promise.all([
      group.loadPerpMarket(
        connection.current,
        marketConfig.marketIndex,
        marketConfig.baseDecimals,
        marketConfig.quoteDecimals
      ),
      group.loadRootBanks(connection.current),
    ])

    const cache = await group.loadCache(connection.current)
    const indexPrice = group.getPriceUi(marketConfig.marketIndex, cache)
    set((s: MarketStore) => {
      s.groupConfig = groupConfig
      s.marketConfig = marketConfig
      s.market = perpMarket
      s.client = client
      s.group = group
      s.info = group.perpMarkets[marketConfig.marketIndex]
      s.cache = cache
      s.indexPrice = indexPrice
    })
  },
}))

export default useMarketStore
