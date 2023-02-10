import { BN } from '@coral-xyz/anchor'
import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import create, { State } from 'zustand'
import { PublicKey } from '@solana/web3.js'

interface gatewayPluginStore extends State {
  state: {
    gatewayToken: PublicKey | null
    gatekeeperNetwork: PublicKey | null
    votingPower: BN
    maxVoteRecord: ProgramAccount<MaxVoterWeightRecord> | null
    isLoadingGatewayToken: boolean
  }
  setGatewayToken: (gatewayToken: PublicKey, votingClient: VotingClient) => void
  setGatekeeperNetwork: (gatekeeperNetwork: PublicKey) => void
  setVotingPower: (gatewayToken: PublicKey) => void
  setMaxVoterWeight: (
    maxVoterRecord: ProgramAccount<MaxVoterWeightRecord> | null
  ) => void
  setIsLoadingGatewayToken: (val: boolean) => void
}

const defaultState = {
  gatewayToken: null,
  gatekeeperNetwork: null,
  votingPower: new BN(0),
  maxVoteRecord: null,
  isLoadingGatewayToken: false,
}

const useGatewayPluginStore = create<gatewayPluginStore>((set, _get) => ({
  state: {
    ...defaultState,
  },
  setIsLoadingGatewayToken: (val) => {
    set((s) => {
      s.state.isLoadingGatewayToken = val
    })
  },
  setGatewayToken: (gatewayToken, votingClient) => {
    votingClient._setCurrentVoterGatewayToken(gatewayToken)
    set((s) => {
      s.state.gatewayToken = gatewayToken
    })
    _get().setVotingPower(gatewayToken)
  },
  setGatekeeperNetwork: (gatekeeperNetwork) => {
    set((s) => {
      s.state.gatekeeperNetwork = gatekeeperNetwork
    })
  },

  setVotingPower: () => {
    set((s) => {
      s.state.votingPower = new BN(1)
    })
  },
  setMaxVoterWeight: (maxVoterRecord) => {
    set((s) => {
      s.state.maxVoteRecord = maxVoterRecord
    })
  },
}))

export default useGatewayPluginStore
