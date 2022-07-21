import { BN } from '@project-serum/anchor'
import create, { State } from 'zustand'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { VotingClient } from '@utils/uiTypes/VotePlugin'

interface SwitchboardPluginStore extends State {
  state: {
    votingPower: BN
    isLoading: boolean
    oracleKeys: Array<PublicKey>
    instructions: Array<TransactionInstruction>
  }
  setVotingPower: (votingPower: BN) => void
  setIsLoading: (val: boolean) => void
  setOracleKeys: (keys: Array<PublicKey>, votingClient: VotingClient) => void
  setInstructions: (
    instructions: Array<TransactionInstruction>,
    votingClient: VotingClient
  ) => void
}

const defaultState = {
  votingPower: new BN(0),
  isLoading: false,
  oracleKeys: [],
  instructions: [],
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
    setOracleKeys: (oracleKeys, votingClient) => {
      votingClient._setOracles(oracleKeys)
      set((s) => {
        s.state.oracleKeys = oracleKeys
      })
    },
    setInstructions: (instructions, votingClient) => {
      votingClient._setInstructions(instructions)
      set((s) => {
        s.state.instructions = instructions
      })
    },
  })
)

export default useSwitchboardPluginStore
