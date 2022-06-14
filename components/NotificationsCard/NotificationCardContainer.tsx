import NotificationsCard from '@components/NotificationsCard'
import NotifiPreviewCard from '@components/NotificationsCard/NotifiPreviewCard'
import { EndpointTypes } from '@models/types'
import {
  BlockchainEnvironment,
  Source,
  useNotifiClient,
} from '@notifi-network/notifi-react-hooks'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

type Props = {
  onBackClick: () => void
}

const NotificationCardContainer: React.FC<Props> = ({ onBackClick }) => {
  const [showPreview, setPreview] = useState(true)
  const router = useRouter()

  const { cluster } = router.query

  const endpoint = cluster ? (cluster as EndpointTypes) : 'mainnet'
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  let env = BlockchainEnvironment.MainNetBeta

  switch (endpoint) {
    case 'mainnet':
      break
    case 'devnet':
      env = BlockchainEnvironment.DevNet
      break
    case 'localnet':
      env = BlockchainEnvironment.LocalNet
      break
  }
  const notifiClient = useNotifiClient({
    dappAddress: 'solanarealmsdao',
    env,
    walletPublicKey: wallet?.publicKey?.toString() ?? '',
  })

  const { data, isAuthenticated, getConfiguration, deleteAlert } = notifiClient

  const [email, setEmail] = useState<string>('')
  const [phoneNumber, setPhone] = useState<string>('')
  const [telegram, setTelegram] = useState<string>('')
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(false)

  useEffect(() => {
    const targetGroup = firstOrNull(data?.targetGroups)
    if (targetGroup) {
      setEmail(firstOrNull(targetGroup?.emailTargets)?.emailAddress ?? '')
      setPhone(firstOrNull(targetGroup?.smsTargets)?.phoneNumber ?? '')
      setTelegram(firstOrNull(targetGroup?.telegramTargets)?.telegramId ?? '')
    } else {
      setEmail(firstOrNull(data?.emailTargets)?.emailAddress ?? '')
      setPhone(firstOrNull(data?.smsTargets)?.phoneNumber ?? '')
      setTelegram(firstOrNull(data?.telegramTargets)?.telegramId ?? '')
    }
  }, [data])

  const updateTelegramSupported = useCallback(async () => {
    const { supportedTargetTypes } = await getConfiguration()
    const telegram = supportedTargetTypes.find(
      (targetType) => targetType === 'TELEGRAM'
    )
    setTelegramEnabled(telegram !== undefined)
  }, [getConfiguration, setTelegramEnabled])

  useEffect(() => {
    updateTelegramSupported().catch((e) => {
      console.error('Failed to get supported type information: ', e)
    })
  }, [updateTelegramSupported])

  const firstOrNull = <T,>(
    arr: ReadonlyArray<T> | null | undefined
  ): T | null => {
    if (arr !== null && arr !== undefined) {
      return arr[0] ?? null
    }
    return null
  }

  useEffect(() => {
    if (isAuthenticated && connected) {
      const targetGroup = firstOrNull(data?.targetGroups)

      if (targetGroup) {
        setEmail(firstOrNull(targetGroup?.emailTargets)?.emailAddress ?? '')
        setPhone(firstOrNull(targetGroup?.smsTargets)?.phoneNumber ?? '')
        setTelegram(firstOrNull(targetGroup?.telegramTargets)?.telegramId ?? '')
      } else {
        setEmail(firstOrNull(data?.emailTargets)?.emailAddress ?? '')
        setPhone(firstOrNull(data?.smsTargets)?.phoneNumber ?? '')
        setTelegram(firstOrNull(data?.telegramTargets)?.telegramId ?? '')
      }

      if (email || phoneNumber || telegram) {
        setPreview(true)
        return
      }
    } else setPreview(false)
  }, [connected, data, email, isAuthenticated, phoneNumber, telegram])

  const handleUnsubscribe = useCallback(
    async (source: Source) => {
      try {
        if (data?.alerts) {
          const sourceId = source.id
          const alertToDelete = data.alerts?.find((alert) =>
            alert.sourceGroup.sources.find((source) => source.id === sourceId)
          )

          alertToDelete?.id &&
            (await deleteAlert({
              alertId: alertToDelete.id,
              keepSourceGroup: true,
              keepTargetGroup: true,
            }))
        }
      } catch (e) {
        throw new Error(e)
      }
    },
    [data?.alerts, deleteAlert]
  )

  return (
    <div className="h-[576]px] w-[507px] absolute top-4 right-0">
      {showPreview ? (
        <NotifiPreviewCard
          handleDelete={handleUnsubscribe}
          email={email}
          // this passes down useNotiClientData
          {...notifiClient}
          phoneNumber={phoneNumber}
          telegram={telegram}
          telegramEnabled={telegramEnabled}
          onBackClick={onBackClick}
          onClick={() => setPreview(false)}
        />
      ) : (
        <NotificationsCard
          phoneNumber={phoneNumber}
          email={email}
          telegram={telegram}
          setPhone={setPhone}
          setTelegram={setTelegram}
          setEmail={setEmail}
          // this passes down useNotiClientData
          {...notifiClient}
          onBackClick={onBackClick}
          setPreview={setPreview}
        />
      )}
    </div>
  )
}

export default NotificationCardContainer
