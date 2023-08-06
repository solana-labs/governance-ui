import { notify } from '@utils/notifications'
import { getPsyFiStrategies } from 'Strategies/protocols/psyfi'
import { getSolendStrategies } from 'Strategies/protocols/solend'
import { TreasuryStrategy } from 'Strategies/types/types'
import create, { State } from 'zustand'

interface StrategiesStore extends State {
  strategies: TreasuryStrategy[]
  strategiesLoading: boolean
  getStrategies: () => void
}

const useStrategiesStore = create<StrategiesStore>((set, _get) => ({
  strategies: [],
  strategiesLoading: false,
  getStrategies: async () => {
    set((s) => {
      s.strategiesLoading = true
    })
    try {
      const [solend, psyfi] = await Promise.all([
        getSolendStrategies(),
        getPsyFiStrategies(),
      ])

      //add fetch functions for your protocol in promise.all
      const strategies: TreasuryStrategy[] = [...solend, ...psyfi]

      set((s) => {
        s.strategies = strategies
      })
    } catch (e) {
      console.log(e)
      notify({ type: 'error', message: "Can't fetch strategies" })
    }
    set((s) => {
      s.strategiesLoading = false
    })
  },
}))

export default useStrategiesStore
