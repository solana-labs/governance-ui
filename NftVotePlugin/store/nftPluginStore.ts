import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { DasNftObject } from '@hooks/queries/digitalAssets'
import create, { State } from 'zustand'

interface nftPluginStore extends State {
  state: {
    votingNfts: DasNftObject[]
    maxVoteRecord: ProgramAccount<MaxVoterWeightRecord> | null
    isLoadingNfts: boolean
  }
  setVotingNfts: (
    nfts: DasNftObject[],
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
