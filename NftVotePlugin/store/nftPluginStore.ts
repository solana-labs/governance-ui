import { BN } from '@project-serum/anchor'
import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { parseMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
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
    realm: MintInfo | undefined
  ) => void
  setVotingPower: (nfts: NFTWithMeta[], mint: MintInfo | undefined) => void
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
  setVotingNfts: (nfts, votingClient, mint) => {
    votingClient._setCurrentVoterNfts(nfts)
    set((s) => {
      s.state.votingNfts = nfts
    })
    _get().setVotingPower(nfts, mint)
  },
  setVotingPower: (nfts, mint) => {
    const mintAmount =
      mint && nfts.length
        ? parseMintNaturalAmountFromDecimalAsBN(mint!.decimals, nfts.length)
        : new BN(0)
    set((s) => {
      s.state.votingPower = mintAmount
    })
  },
  setMaxVoterWeight: (maxVoterRecord) => {
    set((s) => {
      s.state.maxVoteRecord = maxVoterRecord
    })
  },
}))

export default useNftPluginStore
