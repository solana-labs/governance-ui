import { useEffect, useState } from 'react'
import {
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import { XIcon } from '@heroicons/react/solid'
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
      }, 6000)

      return () => {
        clearInterval(id)
      }
    }
  }, [notifications, setNotificationStore])

  return (
    <div
      className={`fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-2000`}
    >
      <div className={`flex flex-col w-full`}>
        {notifications.map((n, idx) => (
          <Notification
            idx={idx}
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

const Notification = ({ type, message, description, txid, idx }) => {
  const [showNotification, setShowNotification] = useState(true)

  if (!showNotification) return null

  return (
    <div
      className={`max-w-sm w-full bg-bkg-1 shadow-lg rounded-md mt-2 pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden bottom-10 left-10 absolute z-[${
        idx + 2000
      }]`}
    >
      <div className={`p-4`}>
        <div className={`flex items-center`}>
          <div className={`flex-shrink-0`}>
            {type === 'success' ? (
              <CheckCircleIcon className={`h-8 w-8 mr-1 text-green`} />
            ) : null}
            {type === 'info' && (
              <InformationCircleIcon className={`h-8 w-8 mr-1`} />
            )}
            {type === 'error' && (
              <XCircleIcon className={`h-8 w-8 mr-1 text-red`} />
            )}
          </div>
          <div className={`ml-2 w-0 flex-1`}>
            <div className={`font-bold text-fgd-1`}>{message}</div>
            {description ? (
              <p className={`mt-0.5 text-sm text-fgd-2`}>{description}</p>
            ) : null}
            {txid ? (
              <a
                href={'https://explorer.solana.com/tx/' + txid}
                className="text-primary"
              >
                View transaction {txid.slice(0, 8)}...
                {txid.slice(txid.length - 8)}
              </a>
            ) : null}
          </div>
          <div className={`ml-4 flex-shrink-0 self-start flex`}>
            <button
              onClick={() => setShowNotification(false)}
              className={`bg-bkg-2 default-transition rounded-md inline-flex text-fgd-3 hover:text-fgd-4 focus:outline-none`}
            >
              <span className={`sr-only`}>Close</span>
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationList
