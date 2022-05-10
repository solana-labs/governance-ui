import Switch from '@components/Switch'
import { Source, useNotifiClient } from '@notifi-network/notifi-react-hooks'
import React, { FunctionComponent, useCallback, useMemo } from 'react'

import NotifiFullLogo from './NotifiFullLogo'
type NotifiClientReturnType = ReturnType<typeof useNotifiClient>

type NotifiPreviewCardProps = {
  onClick: () => void
  telegramEnabled: boolean
  email: string
  phoneNumber: string
  telegram: string
  handleDelete: (source: Source) => Promise<void>
} & Pick<NotifiClientReturnType, 'createAlert' | 'data'>

const NotifiPreviewCard: FunctionComponent<NotifiPreviewCardProps> = ({
  createAlert,
  email,
  handleDelete,
  onClick,
  phoneNumber,
  telegram,
  telegramEnabled,
  data,
}) => {
  const alerts = data?.alerts
  const sources = data?.sources

  const handleEdit = useCallback(() => {
    onClick()
  }, [onClick])

  const Line = () => (
    <div className="border-b-2 border-white-800 opacity-20 col-span-12 py-3" />
  )

  const handleSubscribe = useCallback(
    async (source: Source) => {
      if (!source) {
        throw new Error('No source provided')
      }
      const filterId = source.applicableFilters[0].id

      if (!filterId) {
        throw new Error('No filter id found')
      }

      try {
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
      } catch (e) {
        throw new Error(e)
      }
    },
    [createAlert, email, phoneNumber, telegram]
  )

  const daoNotifications = useMemo(
    () => (source: Source) => {
      const handleClick = (source: Source) => {
        isChecked ? handleDelete(source) : handleSubscribe(source)
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
    <div className="grid grid-cols-12 bg-bkg-1 px-10 py-3 text-sm w-full">
      <div className="col-span-12">
        <p className="py-0.5">{email}</p>
        <p className="py-0.5">{phoneNumber}</p>
        {telegramEnabled && <p className="py-0.5">{telegram}</p>}
        <a
          className="text-sm text-primary-dark cursor-pointer pb-2 font-medium"
          onClick={handleEdit}
        >
          Edit Information
        </a>
      </div>

      {notificationsToggle && notificationsToggle.length >= 1 && (
        <>
          <Line />
          <div className="max-h-[200px] w-full snap-y col-span-12 overflow-scroll">
            {notificationsToggle}
          </div>
          <Line />
        </>
      )}
      <div className="col-span-12 flex flex-row pt-4 items-center">
        <p className="text-white text-[10px] font-light w-fit whitespace-nowrap flex-start">
          Powered by
        </p>
        <span>
          <NotifiFullLogo height="12" width="60" />
        </span>
      </div>
      <a
        className="col-end-13 text-xs text-primary-dark cursor-pointer col-span-3 relative -top-4"
        href="https://docs.notifi.network/"
      >
        Learn More
      </a>
    </div>
  )
}

export default NotifiPreviewCard
