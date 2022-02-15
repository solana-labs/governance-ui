import create, { State } from 'zustand'
import produce from 'immer'
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

export interface MarketStore extends State {
  groupConfig: GroupConfig
  marketConfig: PerpMarketConfig
  cache?: MangoCache
  client?: MangoClient
  group?: MangoGroup
  info?: PerpMarketInfo
  market?: PerpMarket
  indexPrice?: number
  quoteCurrency?: TokenInfo
  quoteRootBank?: RootBank
  set: (x: any) => void
}

const GROUP = 'devnet.2'
const GROUP_CONFIG = Config.ids().getGroupWithName(GROUP)!
const DEFAULT_MARKET = 'SOL'
const DEFAULT_MARKET_INDEX = getMarketIndexBySymbol(
  GROUP_CONFIG,
  DEFAULT_MARKET
)
const DEFAULT_MARKET_CONFIG = GROUP_CONFIG?.perpMarkets[DEFAULT_MARKET_INDEX]

const useMarketStore = create<MarketStore>((set, _get) => ({
  groupConfig: GROUP_CONFIG,
  marketConfig: DEFAULT_MARKET_CONFIG,
  set: (fn) => set(produce(fn)),
}))

export default useMarketStore
