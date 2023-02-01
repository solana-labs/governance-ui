import create, { State } from 'zustand'
import { BN } from '@project-serum/anchor'
import { PositionWithVotingMint } from 'HeliumVotePlugin/sdk/types'
import {
  GetPositionsArgs as GetPosArgs,
  getPositions,
} from '../utils/getPositions'
import { VotingClient } from '@utils/uiTypes/VotePlugin'

interface HeliumVsrStoreState {
  positions: PositionWithVotingMint[]
  amountLocked: BN
  votingPower: BN
  isLoading: boolean
}

interface GetPositionsArgs extends GetPosArgs {
  votingClient: VotingClient
}

interface HeliumVsrStore extends State {
  state: HeliumVsrStoreState
  resetState: () => void
  getPositions: (args: GetPositionsArgs) => Promise<void>
}

const defaultState: HeliumVsrStoreState = {
  positions: [],
  amountLocked: new BN(0),
  votingPower: new BN(0),
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
  getPositions: async ({ votingClient, ...args }) => {
    set((s) => {
      s.state.isLoading = true
    })

    try {
      const { positions, amountLocked, votingPower } = await getPositions(args)
      votingClient._setCurrentHeliumVsrPositions(positions)
      set((s) => {
        s.state.positions = positions
        s.state.amountLocked = amountLocked
        s.state.votingPower = votingPower
      })
    } catch (e) {
      throw new Error(e)
    } finally {
      set((s) => {
        s.state.isLoading = false
      })
    }
  },
}))

export default useHeliumVsrStore
