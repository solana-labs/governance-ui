import create, { State } from 'zustand'
import { ViewState } from '@components/Members/types'
import { Member } from '@utils/uiTypes/members'

interface MembersStore extends State {
  compact: {
    currentView: ViewState
    currentMember: Member | null
  }
  setCurrentCompactViewMember: (item: Member) => void
  setCurrentCompactView: (viewState: ViewState) => void
  resetCompactViewState: () => void
}

const compactDefaultState = {
  currentView: ViewState.MainView,
  currentMember: null,
}

const useMembersStore = create<MembersStore>((set, _get) => ({
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

export default useMembersStore
