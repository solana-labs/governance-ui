import create, { State } from 'zustand'
import produce from 'immer'
import { persist } from 'zustand/middleware'

interface NotificationStore extends State {
  notifications: Array<{
    type: string
    message: string
    description?: string
    txid?: string
  }>
  set: (x: any) => void
}

const useNotificationStore = create<NotificationStore>(
  persist(
    (set, _get) => ({
      notifications: [],
      set: (fn) => set(produce(fn)),
    }),
    {
      name: 'notifications',
    }
  )
)

export default useNotificationStore
