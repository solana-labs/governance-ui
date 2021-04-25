import { useEffect, useState } from 'react'
import {
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import useNotificationStore from '../stores/useNotificationStore'

const NotificationList = () => {
  const { notifications, set: setNotificationStore } = useNotificationStore(
    (s) => s
  )

  useEffect(() => {
    if (notifications.length > 0) {
      const id = setInterval(() => {
        setNotificationStore((state) => {
          state.notifications = notifications.slice(1, notifications.length)
        })
      }, 5000)

      return () => {
        clearInterval(id)
      }
    }
  }, [notifications, setNotificationStore])

  const reversedNotifications = [...notifications].reverse()

  return (
    <div
      className={`fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6`}
    >
      <div className={`flex flex-col w-full`}>
        {reversedNotifications.map((n, idx) => (
          <Notification
            key={`${n.message}${idx}`}
            type={n.type}
            message={n.message}
            description={n.description}
            txid={n.txid}
          />
        ))}
      </div>
    </div>
  )
}

const Notification = ({ type, message, description, txid }) => {
  const [showNotification, setShowNotification] = useState(true)

  if (!showNotification) return null

  return (
    <div
      className={`max-w-sm w-full bg-th-bkg-3 shadow-lg rounded-md mt-2 pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
    >
      <div className={`p-4`}>
        <div className={`flex items-center`}>
          <div className={`flex-shrink-0`}>
            {type === 'success' ? (
              <CheckCircleIcon className={`text-th-green h-9 w-9 mr-1`} />
            ) : null}
            {type === 'info' && (
              <XCircleIcon className={`text-th-primary h-9 w-9 mr-1`} />
            )}
            {type === 'error' && (
              <InformationCircleIcon className={`text-th-red h-9 w-9 mr-1`} />
            )}
          </div>
          <div className={`ml-2 w-0 flex-1`}>
            <div className={`text-lg text-th-fgd-1`}>{message}</div>
            {description ? (
              <p className={`mt-0.5 text-base text-th-fgd-2`}>{description}</p>
            ) : null}
            {txid ? (
              <a
                href={'https://explorer.solana.com/tx/' + txid}
                className="text-th-primary"
              >
                View transaction {txid.slice(0, 8)}...
                {txid.slice(txid.length - 8)}
              </a>
            ) : null}
          </div>
          <div className={`ml-4 flex-shrink-0 self-start flex`}>
            <button
              onClick={() => setShowNotification(false)}
              className={`bg-th-bkg-3 rounded-md inline-flex text-fgd-3 hover:text-th-fgd-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-th-primary`}
            >
              <span className={`sr-only`}>Close</span>
              <svg
                className={`h-5 w-5`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationList
