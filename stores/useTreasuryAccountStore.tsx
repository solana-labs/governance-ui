import create, { State } from 'zustand'
import produce from 'immer'
import { ViewState } from '@components/TreasuryAccount/Types'

interface TreasuryAccountStore extends State {
  currentView: ViewState
  set: (x: any) => void
}

const useTreasuryAccountStore = create<TreasuryAccountStore>((set, _get) => ({
  currentView: ViewState.MainView,
  set: (fn) => set(produce(fn)),
}))

export default useTreasuryAccountStore
