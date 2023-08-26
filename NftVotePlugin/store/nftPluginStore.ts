import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import { NFTWithMeta, VotingClient } from '@utils/uiTypes/VotePlugin'
import create, { State } from 'zustand'

interface nftPluginStore extends State {
  state: {
    votingNfts: NFTWithMeta[]
    maxVoteRecord: ProgramAccount<MaxVoterWeightRecord> | null
    isLoadingNfts: boolean
  }
  setVotingNfts: (
    nfts: NFTWithMeta[],
    votingClient: VotingClient,
    nftMintRegistrar: any
  ) => void
  setMaxVoterWeight: (
    maxVoterRecord: ProgramAccount<MaxVoterWeightRecord> | null
  ) => void
  setIsLoadingNfts: (val: boolean) => void
}

const defaultState = {
  votingNfts: [],
  maxVoteRecord: null,
  isLoadingNfts: false,
}

/**
 * @deprecated
 * instead of using this, query directly whatever it is you wanna query. we can make a query for getting voting NFTs.
 */
const useNftPluginStore = create<nftPluginStore>((set, _get) => ({
  state: {
    ...defaultState,
  },
  setIsLoadingNfts: (val) => {
    set((s) => {
      s.state.isLoadingNfts = val
    })
  },
  setVotingNfts: (nfts, votingClient, _nftMintRegistrar) => {
    votingClient._setCurrentVoterNfts(nfts)
    set((s) => {
      s.state.votingNfts = nfts
    })
  },

  setMaxVoterWeight: (maxVoterRecord) => {
    set((s) => {
      s.state.maxVoteRecord = maxVoterRecord
    })
  },
}))

export default useNftPluginStore
