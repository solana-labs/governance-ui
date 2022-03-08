import { ConnectionContext } from '@utils/connection'
import { notify } from '@utils/notifications'
import { GovernedTokenAccount } from '@utils/tokens'
import { tvl } from 'Strategies/protocols/mango/tools'
import { TreasuryStrategy } from 'Strategies/types/types'
import create, { State } from 'zustand'
import { MarketStore } from './marketStore'

interface StrategiesStore extends State {
  strategies: TreasuryStrategy[]
  strategiesLoading: boolean
  getStrategies: (
    market: MarketStore,
    connection: ConnectionContext,
    governedTokenAccountsWithoutNfts: GovernedTokenAccount[]
  ) => void
}

const useStrategiesStore = create<StrategiesStore>((set, _get) => ({
  strategies: [],
  strategiesLoading: false,
  getStrategies: async (
    market: MarketStore,
    connection: ConnectionContext,
    governedTokenAccountsWithoutNfts: GovernedTokenAccount[]
  ) => {
    set((s) => {
      s.strategiesLoading = true
    })
    try {
      const mango = await tvl(
        Date.now() / 1000,
        market,
        connection,
        governedTokenAccountsWithoutNfts
      )
      //add fetch functions for your protocol in promise.all
      const strategies: TreasuryStrategy[] = [...mango]
      set((s) => {
        s.strategies = strategies
      })
    } catch (e) {
      console.log(e)
      notify({ type: 'error', message: "Can't fetch MNGO strategies" })
    }
    set((s) => {
      s.strategiesLoading = false
    })
  },
}))

export default useStrategiesStore
