import { NFTWithMeta, VotingClient } from '@utils/uiTypes/VotePlugin'
import create, { State } from 'zustand'

interface nftPluginStore extends State {
  state: {
    votingNfts: NFTWithMeta[]
  }
  setVotingNfts: (nfts: NFTWithMeta[], votingClient: VotingClient) => void
}

const defaultState = {
  votingNfts: [],
}

const useNftPluginStore = create<nftPluginStore>((set, _get) => ({
  state: {
    ...defaultState,
  },
  setVotingNfts: (nfts, votingClient) => {
    votingClient._setCurrentVoterNfts(nfts)
    set((s) => {
      s.state.votingNfts = nfts
    })
  },
}))

export default useNftPluginStore
