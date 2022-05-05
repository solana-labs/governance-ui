import { BN } from '@project-serum/anchor'
import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import { NFTWithMeta, VotingClient } from '@utils/uiTypes/VotePlugin'
import create, { State } from 'zustand'

interface nftPluginStore extends State {
  state: {
    votingNfts: NFTWithMeta[]
    votingPower: BN
    maxVoteRecord: ProgramAccount<MaxVoterWeightRecord> | null
    isLoadingNfts: boolean
  }
  setVotingNfts: (
    nfts: NFTWithMeta[],
    votingClient: VotingClient,
    nftMintRegistrar: any
  ) => void
  setVotingPower: (nfts: NFTWithMeta[], nftMintRegistrar: any) => void
  setMaxVoterWeight: (
    maxVoterRecord: ProgramAccount<MaxVoterWeightRecord> | null
  ) => void
  setIsLoadingNfts: (val: boolean) => void
}

const defaultState = {
  votingNfts: [],
  votingPower: new BN(0),
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
  setVotingNfts: (nfts, votingClient, nftMintRegistrar) => {
    const filteredNfts = nfts.filter(
      (x) => x.token.account.amount.cmpn(1) === 0
    )
    votingClient._setCurrentVoterNfts(filteredNfts)
    set((s) => {
      s.state.votingNfts = filteredNfts
    })
    _get().setVotingPower(filteredNfts, nftMintRegistrar)
  },
  setVotingPower: (nfts, nftMintRegistrar) => {
    const votingPower = nfts
      .map(
        (x) =>
          nftMintRegistrar?.collectionConfigs?.find(
            (j) =>
              j.collection?.toBase58() === x.metadata?.data?.collection?.key
          )?.weight || new BN(0)
      )
      .reduce((prev, next) => prev.add(next), new BN(0))
    set((s) => {
      s.state.votingPower = votingPower
    })
  },
  setMaxVoterWeight: (maxVoterRecord) => {
    set((s) => {
      s.state.maxVoteRecord = maxVoterRecord
    })
  },
}))

export default useNftPluginStore
