import Button from '../Button'
import Switch from '@components/Switch'
import { ArrowLeftIcon } from '@heroicons/react/solid'
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
  onBackClick: () => void
  telegramEnabled: boolean
  email: string
  phoneNumber: string
  telegram: string
  handleDelete: (source: Source) => Promise<void>
} & Pick<NotifiClientReturnType, 'createAlert' | 'data' | 'isAuthenticated'>

const Line = () => (
  <div className="border-b-2 border-white-800 opacity-20 col-span-12 py-3" />
)

const NotifiPreviewCard: FunctionComponent<NotifiPreviewCardProps> = ({
  createAlert,
  data,
  email,
  handleDelete,
  onBackClick,
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
          className="items-center snap-center w-full col-span-12 pt-4 flex flex-row justify-between"
          key={source.id}
        >
          <div className="text-xs align-items-center">
            {source.name} Notifications On
          </div>
          <Switch checked={isChecked} onChange={() => handleClick(source)} />
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
    <div className="bg-bkg-5 p-4 h-full w-full md:p-6 rounded-lg">
      <div className="flex flex-row items-center align-center">
        <Button className="bg-transparent" onClick={onBackClick}>
          <ArrowLeftIcon className="w-6 h-6" fill="#80829D" />
        </Button>
      </div>
      <h2 className="mb-2 font-light text-center">Realms Notifications</h2>
      <div className="grid grid-cols-12 bg-bkg-5 px-6 py-3 text-sm w-full">
        <div className="col-span-12">
          <p className="py-0.5">{email}</p>
          <p className="py-0.5">{phoneNumber}</p>
          {telegramEnabled && <p className="py-0.5 pb-2">{telegram}</p>}
          <a
            className="text-sm text-blue cursor-pointer pb-2 font-medium underline color=00E4FF"
            onClick={handleEdit}
          >
            Edit Information
          </a>
        </div>

        {notificationsToggle && notificationsToggle.length >= 1 && (
          <>
            <Line />
            <div className="min-h-[200px] w-full snap-y col-span-12 overflow-scroll">
              {notificationsToggle}
            </div>
            <Line />
          </>
        )}
      </div>
      <div className="w-full">
        <div className="flex px-6 justify-between flex-row">
          <div className=" flex flex-row">
            <p className="text-white text-[10px] font-light whitespace-nowrap flex-start">
              Powered by
            </p>
            <span>
              <NotifiFullLogo height="12" width="60" />
            </span>
          </div>
          <a
            className="text-xs text-[10px] underline cursor-pointer text-blue col-span-3 relative "
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
