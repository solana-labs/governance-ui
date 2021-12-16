import create, { State } from 'zustand'
import { ViewState } from '@components/Members/types'

interface MembersListStore extends State {
  compact: {
    currentView: ViewState
  }
  setCurrentCompactView: (viewState: ViewState) => void
  resetCompactViewState: () => void
}

const compactDefaultState = {
  currentView: ViewState.MainView,
}

const useTreasuryAccountStore = create<MembersListStore>((set, _get) => ({
  compact: {
    ...compactDefaultState,
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

export default useTreasuryAccountStore
