import { ConnectionContext } from '@utils/connection'
import { notify } from '@utils/notifications'
import { tvl } from 'Strategies/protocols/mango/tools'
import { TreasuryStrategy } from 'Strategies/types/types'
import create, { State } from 'zustand'

interface StrategiesStore extends State {
  strategies: TreasuryStrategy[]
  strategiesLoading: boolean
  getStrategies: (connection: ConnectionContext) => void
}

const useStrategiesStore = create<StrategiesStore>((set, _get) => ({
  strategies: [],
  strategiesLoading: false,
  getStrategies: async (connection: ConnectionContext) => {
    set((s) => {
      s.strategiesLoading = true
    })
    try {
      const mango = await tvl(Date.now() / 1000, connection)
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
