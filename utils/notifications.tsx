import useNotificationStore from '../stores/useNotificationStore'

export function notify(newNotification: {
  type?: string
  message: string
  description?: string
  txid?: string
}) {
  const { notifications, set: setNotificationStore } =
    useNotificationStore.getState()

  setNotificationStore((state) => {
    state.notifications = [
      ...notifications,
      { type: 'success', ...newNotification },
    ]
  })
}
