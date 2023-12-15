import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import create, { State } from 'zustand'

interface nftPluginStore extends State {
  state: {
    maxVoteRecord: ProgramAccount<MaxVoterWeightRecord> | null
  }
  setMaxVoterWeight: (
    maxVoterRecord: ProgramAccount<MaxVoterWeightRecord> | null
  ) => void
}

const defaultState = {
  maxVoteRecord: null,
}

/**
 * @deprecated
 * instead of using this, query directly whatever it is you wanna query. we can make a query for getting voting NFTs.
 */
const useNftPluginStore = create<nftPluginStore>((set, _get) => ({
  state: {
    ...defaultState,
  },
  setMaxVoterWeight: (maxVoterRecord) => {
    set((s) => {
      s.state.maxVoteRecord = maxVoterRecord
    })
  },
}))

export default useNftPluginStore
