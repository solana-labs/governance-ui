import create, { State } from 'zustand'
import { TokenRecordWithWallet, ViewState } from '@components/Members/types'

interface MembersListStore extends State {
  compact: {
    currentView: ViewState
    currentMember: TokenRecordWithWallet | null
  }
  setCurrentCompactViewMember: (item: TokenRecordWithWallet) => void
  setCurrentCompactView: (viewState: ViewState) => void
  resetCompactViewState: () => void
}

const compactDefaultState = {
  currentView: ViewState.MainView,
  currentMember: null,
}

const useTreasuryAccountStore = create<MembersListStore>((set, _get) => ({
  compact: {
    ...compactDefaultState,
  },
  setCurrentCompactViewMember: (item) => {
    set((s) => {
      s.compact.currentMember = item
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

export default useTreasuryAccountStore
