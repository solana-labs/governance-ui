import {BN} from '@coral-xyz/anchor'
import {MaxVoterWeightRecord, ProgramAccount} from '@solana/spl-governance'
import create, {State} from 'zustand'
import {Coefficients, DEFAULT_COEFFICIENTS} from "../sdk/api";

interface QuadraticPluginStore extends State {
  state: {
    votingPower: BN
    maxVoteRecord: ProgramAccount<MaxVoterWeightRecord> | null
  }
  setVotingPower: (communityTokenRecordPower: BN) => void
  setMaxVoterWeight: (
    maxVoterRecord: ProgramAccount<MaxVoterWeightRecord> | null
  ) => void
}

const defaultState = {
  votingPower: new BN(0),
  maxVoteRecord: null,
}

// note this is not bignumber-safe - TODO use a bigdecimal library to ensure the frontend values match the real ones
const applyCoefficients = (x: BN, coefficients: Coefficients) => {
  const [ a, b, c ] = coefficients

  const number = x.toNumber();
  const rootX = Math.sqrt(x.toNumber());

  return new BN(
      Math.floor(
          a * rootX + b * number + c
      )
  )
}

const useQuadraticPluginStore = create<QuadraticPluginStore>((set, _get) => ({
  state: {
    ...defaultState,
  },

  setVotingPower: (communityTokenRecordPower: BN) => {
    set((s) => {
      // Assuming Default Coefficients - just performing square root - TODO use the quadraticClient for this
      s.state.votingPower = applyCoefficients(communityTokenRecordPower, DEFAULT_COEFFICIENTS)
    })
  },
  setMaxVoterWeight: (maxVoterRecord) => {
    set((s) => {
      s.state.maxVoteRecord = maxVoterRecord
    })
  },
}))

export default useQuadraticPluginStore
