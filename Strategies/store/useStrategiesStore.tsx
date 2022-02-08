import { tvl } from 'Strategies/protocols/mango/tools'
import { TreasuryStrategy } from 'Strategies/types/types'
import create, { State } from 'zustand'

interface StrategiesStore extends State {
  strategies: TreasuryStrategy[]
  getStrategies: () => void
}

const useAssetsStore = create<StrategiesStore>((set, _get) => ({
  strategies: [],
  getStrategies: async () => {
    const mango = await tvl(Date.now() / 1000)
    //add fetch functions for your protocol in promise.all
    const strategies: TreasuryStrategy[] = [...mango]
    set((s) => {
      s.strategies = strategies
    })
  },
}))

export default useAssetsStore
