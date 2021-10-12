import produce from 'immer'
import create, { State } from 'zustand'

interface RealmContextStore extends State {
  isRealmContext: boolean
  set: (x: any) => void
}

const useRealmContextStore = create<RealmContextStore>((set, _get) => ({
  isRealmContext: false,
  set: (fn) => set(produce(fn)),
}))

export default useRealmContextStore
