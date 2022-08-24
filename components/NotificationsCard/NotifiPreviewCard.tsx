import Switch from './NotifiSwitch'
import { XIcon } from '@heroicons/react/solid'
import { Source, useNotifiClient } from '@notifi-network/notifi-react-hooks'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import NotifiFullLogo from './NotifiFullLogo'
type NotifiClientReturnType = ReturnType<typeof useNotifiClient>

type NotifiPreviewCardProps = {
  onClick: () => void
  onClose: () => void
  telegramEnabled: boolean
  email: string
  phoneNumber: string
  telegram: string
  handleDelete: (source: Source) => Promise<void>
} & Pick<NotifiClientReturnType, 'createAlert' | 'data' | 'isAuthenticated'>

const NotifiPreviewCard: FunctionComponent<NotifiPreviewCardProps> = ({
  createAlert,
  data,
  email,
  handleDelete,
  onClose,
  onClick,
  phoneNumber,
  telegram,
  telegramEnabled,
  isAuthenticated,
}) => {
  const alerts = data?.alerts
  const sources = data?.sources
  const [isLoading, setLoading] = useState(false)

  const handleEdit = useCallback(() => {
    onClick()
  }, [onClick])

  useEffect(() => {
    if (!isAuthenticated) {
      onClick()
    }
  }, [isAuthenticated])

  const handleUnsubscribe = useCallback(
    async (source: Source) => {
      if (isLoading) {
        return
      }
      handleDelete(source)
    },
    [handleDelete, isLoading]
  )

  useEffect(() => {
    if (!isAuthenticated) {
      onClick()
    }
  }, [isAuthenticated])

  const handleSubscribe = useCallback(
    async (source: Source) => {
      if (isLoading) {
        return
      }

      if (!source) {
        throw new Error('No source provided')
      }
      const filterId = source.applicableFilters[0].id

      if (!filterId) {
        throw new Error('No filter id found')
      }
      try {
        setLoading(true)
        const alertResult = await createAlert({
          emailAddress: email === '' ? null : email,
          filterId: filterId ?? '',
          name: `${source.name} notification`,
          phoneNumber: phoneNumber === '' ? null : phoneNumber,
          sourceId: source.id ?? '',
          telegramId: telegram === '' ? null : telegram,
        })

        if (alertResult) {
          if (alertResult.targetGroup?.telegramTargets?.length > 0) {
            const target = alertResult.targetGroup?.telegramTargets[0]
            if (target && !target.isConfirmed) {
              if (target.confirmationUrl) {
                window.open(target.confirmationUrl)
              }
            }
          }
        }
        setLoading(false)
      } catch (e) {
        throw new Error(e)
      }
    },
    [createAlert, email, phoneNumber, telegram, isLoading]
  )

  const daoNotifications = useMemo(
    () => (source: Source) => {
      const handleClick = (source: Source) => {
        isChecked ? handleUnsubscribe(source) : handleSubscribe(source)
      }
      const sourceId = source.id

      const isChecked = Boolean(
        alerts?.some((alert) =>
          alert.sourceGroup.sources.some((source) => source.id === sourceId)
        )
      )

      return (
        <div
          key={source.id}
          className="w-full flex flex-row text-[14px] tracking-tight"
        >
          <div className="font-rota text-opacity-75 font-thin break-words w-3/4 inline-block">
            {source.name} Notifications On
          </div>
          <div className="inline-block w-1/4">
            <Switch checked={isChecked} onChange={() => handleClick(source)} />
          </div>
        </div>
      )
    },
    [alerts, handleDelete, handleSubscribe]
  )

  const notificationsToggle = useMemo(
    () =>
      sources
        ?.map((source) => {
          if (source.type === 'DIRECT_PUSH') {
            return
          }
          return daoNotifications(source)
        })
        ?.filter((source) => source),
    [daoNotifications, sources]
  )

  return (
    <div className="w-80 flex flex-col divide-y-[1px] divide-slate-700 justify-between w-full rounded-lg">
      <div className="flex flex-col text-[16px] w-full py-4 px-6">
        <div className="flex flex-row justify-between font-roboto">
          <h2 className="flex font-bold text-left">Notifications</h2>
          <XIcon
            className="flex cursor-pointer w-6 h-6"
            fill="#80829D"
            onClick={onClose}
          />
        </div>
        <p className="text-md py-0.5">{email}</p>
        <p className="text-md py-0.5">{phoneNumber}</p>
        {telegramEnabled && <p className="py-0.5 pb-2">{telegram}</p>}
        <div
          className="text-primary-light cursor-pointer mb-4 font-medium"
          onClick={handleEdit}
        >
          Edit Information
        </div>
      </div>
      {notificationsToggle && notificationsToggle.length >= 1 ? (
        <div className="w-full max-h-96 text-secondary-grey flex flex-col overflow-y-auto px-6 py-4">
          {notificationsToggle}
        </div>
      ) : null}
      <div className="flex flex-row justify-between bottom-0 text-secondary-grey text-[10px] py-4 px-6 font-rota font-thin">
        <div className="flex">
          <p className="whitespace-nowrap text-[10px] flex-start">Powered by</p>
          <span className="flex">
            <NotifiFullLogo height="12" width="60" />
          </span>
        </div>
        <div className="-mt-1 flex">
          <a
            className="underline cursor-pointer"
            href="https://www.notifi.network/faqs"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  )
}

export default NotifiPreviewCard
