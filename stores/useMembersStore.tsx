import create, { State } from 'zustand'
import { ViewState } from '@components/Members/types'
import { Member, Delegates } from '@utils/uiTypes/members'

interface MembersStore extends State {
  compact: {
    currentView: ViewState
    currentMember: Member | null
    members: Member[]
    activeMembers: Member[]
    //delegates: Delegates | null
  }
  setCurrentCompactViewMember: (item: Member) => void
  setCurrentCompactView: (viewState: ViewState) => void
  resetCompactViewState: () => void
  setMembers: (members: Member[]) => void
  //setDelegates: (delegates: Delegates) => void
}

const compactDefaultState = {
  currentView: ViewState.MainView,
  currentMember: null,
  members: [],
  activeMembers: [],
  //delegates: null,
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
  setMembers: (members: Member[]) => {
    const activeMembers: Member[] = members.filter(
      (x) => !x.councilVotes.isZero() || !x.communityVotes.isZero()
    )
    set((s) => {
      s.compact.members = members
      s.compact.activeMembers = activeMembers
    })
  },
}))

export default useMembersStore
