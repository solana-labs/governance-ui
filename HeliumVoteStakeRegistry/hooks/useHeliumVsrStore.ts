import create, { State } from 'zustand'
import { BN } from '@project-serum/anchor'
import { NFTWithMeta } from '@utils/uiTypes/VotePlugin'
import { PositionWithVotingMint } from 'HeliumVoteStakeRegistry/sdk/types'
import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import { GetPositionsArgs, getPositions } from '../utils/getPositions'

interface HeliumVsrStoreState {
  positions: PositionWithVotingMint[]
  amountLocked: BN
  votingPower: BN
  votingNfts: NFTWithMeta[]
  maxVoteRecord: ProgramAccount<MaxVoterWeightRecord> | null
  isLoading: boolean
}

interface HeliumVsrStore extends State {
  state: HeliumVsrStoreState
  resetState: () => void
  getPositions: (args: GetPositionsArgs) => Promise<void>
  // setVotingNfts: (nfts: NFTWithMeta[], votingClient: VotingClient) => void
}

const defaultState: HeliumVsrStoreState = {
  positions: [],
  amountLocked: new BN(0),
  votingPower: new BN(0),
  votingNfts: [],
  maxVoteRecord: null,
  isLoading: false,
}

const useHeliumVsrStore = create<HeliumVsrStore>((set, _get) => ({
  state: {
    ...defaultState,
  },
  resetState: () =>
    set((s) => {
      s.state = { ...defaultState }
    }),
  getPositions: async (args) => {
    set((s) => {
      s.state.isLoading = true
    })

    try {
      const { positions, amountLocked, votingPower } = await getPositions(args)
      set((s) => {
        s.state.positions = positions
        ;(s.state.amountLocked = amountLocked),
          (s.state.votingPower = votingPower)
      })
    } catch (e) {
      throw new Error(e)
    } finally {
      set((s) => {
        s.state.isLoading = false
      })
    }
  },
  // setVotingNfts: () => {},
}))

export default useHeliumVsrStore
