import create, { State } from 'zustand'
import { BN } from '@coral-xyz/anchor'
import { ProgramAccount } from '@solana/spl-governance'
import { PositionWithMeta } from 'HeliumVotePlugin/sdk/types'
import {
  GetPositionsArgs as GetPosArgs,
  getPositions,
} from '../utils/getPositions'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { MaxVoterWeightRecord } from '@solana/spl-governance'

interface HeliumVsrStoreState {
  positions: PositionWithMeta[]
  amountLocked: BN
  votingPower: BN
  maxVoteRecord: ProgramAccount<MaxVoterWeightRecord> | null
  isLoading: boolean
}

interface GetPositionsArgs extends GetPosArgs {
  votingClient: VotingClient
}

interface PropagatePositionsArgs {
  votingClient: VotingClient
}

interface HeliumVsrStore extends State {
  state: HeliumVsrStoreState
  resetState: () => void
  setMaxVoterWeight: (
    maxVoterRecord: ProgramAccount<MaxVoterWeightRecord> | null
  ) => void
  getPositions: (args: GetPositionsArgs) => Promise<void>
  propagatePositions: (args: PropagatePositionsArgs) => void
}

const defaultState: HeliumVsrStoreState = {
  positions: [],
  amountLocked: new BN(0),
  votingPower: new BN(0),
  maxVoteRecord: null,
  isLoading: false,
}

const useHeliumVsrStore = create<HeliumVsrStore>((set, _get) => ({
  state: {
    ...defaultState,
  },
  resetState: () => {
    set((s) => {
      s.state = { ...defaultState }
    })
  },
  setMaxVoterWeight: (maxVoterRecord) => {
    set((s) => {
      s.state.maxVoteRecord = maxVoterRecord
    })
  },
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
  propagatePositions: ({ votingClient }) => {
    votingClient._setCurrentHeliumVsrPositions(_get().state.positions)
  },
}))

export default useHeliumVsrStore
