import { BN } from '@project-serum/anchor'
import create, { State } from 'zustand'

interface SwitchboardPluginStore extends State {
  state: {
    votingPower: BN
    isLoading: boolean
  }
  setVotingPower: (votingPower: BN) => void
  setIsLoading: (val: boolean) => void
}

const defaultState = {
  votingPower: new BN(0),
  isLoading: false,
}

const useSwitchboardPluginStore = create<SwitchboardPluginStore>(
  (set, _get) => ({
    state: {
      ...defaultState,
    },
    setIsLoading: (val) => {
      set((s) => {
        s.state.isLoading = val
      })
    },
    setVotingPower: (votingPower) => {
      set((s) => {
        s.state.votingPower = votingPower
      })
    },
  })
)

export default useSwitchboardPluginStore
