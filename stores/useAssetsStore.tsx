import create, { State } from 'zustand'
import { ViewState } from '@components/AssetsList/types'
import { Governance } from '@models/accounts'
import { ProgramAccount } from '@solana/spl-governance'

interface AssetsStore extends State {
  compact: {
    currentView: ViewState
    currentAsset: ProgramAccount<Governance> | null
  }
  setCurrentCompactViewAsset: (item: ProgramAccount<Governance> | null) => void
  setCurrentCompactView: (viewState: ViewState) => void
  resetCompactViewState: () => void
}

const compactDefaultState = {
  currentView: ViewState.MainView,
  currentAsset: null,
}

const useAssetsStore = create<AssetsStore>((set, _get) => ({
  compact: {
    ...compactDefaultState,
  },
  setCurrentCompactViewAsset: (item) => {
    set((s) => {
      s.compact.currentAsset = item
    })
  },
  setCurrentCompactView: (viewState) => {
    set((s) => {
      s.compact.currentView = viewState
    })
  },
  resetCompactViewState: () => {
    set((s) => {
      s.compact = { ...compactDefaultState }
    })
  },
}))

export default useAssetsStore
