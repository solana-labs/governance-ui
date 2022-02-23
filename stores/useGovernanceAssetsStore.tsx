import create, { State } from 'zustand'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { HIDDEN_GOVERNANCES } from '@components/instructions/tools'
import { GovernedTokenAccount } from '@utils/tokens'

interface GovernanceAssetsStore extends State {
  governancesArray: ProgramAccount<Governance>[]
  governedTokenAccounts: GovernedTokenAccount[]
  setGovernancesArray: (governances: {
    [governance: string]: ProgramAccount<Governance>
  }) => void
  setGovernedTokenAccounts: (items: GovernedTokenAccount[]) => void
}

const defaultState = {
  governancesArray: [],
  governedTokenAccounts: [],
}

const useGovernanceAssetsStore = create<GovernanceAssetsStore>((set, _get) => ({
  ...defaultState,
  setGovernancesArray: (governances) => {
    set((s) => {
      s.governancesArray = Object.keys(governances)
        .filter((gpk) => !HIDDEN_GOVERNANCES.has(gpk))
        .map((key) => governances[key])
    })
  },
  setGovernedTokenAccounts: (items) => {
    set((s) => {
      s.governedTokenAccounts = items
    })
  },
}))

export default useGovernanceAssetsStore
