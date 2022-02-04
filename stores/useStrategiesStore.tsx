import create, { State } from 'zustand'
import { TreasuryStrategy } from '@components/TreasuryAccount/BigView/types/types'
import { tvl } from '@components/TreasuryAccount/BigView/strategies/mango/tools'

interface StrategiesStore extends State {
  strategies: TreasuryStrategy[]
  getStrategies: () => void
}

const useAssetsStore = create<StrategiesStore>((set, _get) => ({
  strategies: [],
  getStrategies: async () => {
    const mango = await tvl(Date.now() / 1000)
    const strategies = [...mango]
    set((s) => {
      s.strategies = strategies
    })
  },
}))

export default useAssetsStore
