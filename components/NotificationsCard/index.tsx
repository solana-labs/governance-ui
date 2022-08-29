import {
  ArrowLeftIcon,
  MailIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/solid'
import {
  Alert,
  GqlError,
  MessageSigner,
  useNotifiClient,
} from '@notifi-network/notifi-react-hooks'
import { firstOrNull } from '@utils/helpers'
import { isValidPhoneNumber } from 'libphonenumber-js'
import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { useCallback } from 'react'

import useWalletStore from '../../stores/useWalletStore'
import Button from '../Button'
import Input from '../inputs/Input'
import NotifiFullLogo from './NotifiFullLogo'
import PhoneInput from './PhoneInput'

type NotifiClientReturnType = ReturnType<typeof useNotifiClient>

type NotificationCardProps = {
  onBackClick: () => void
  email: string

  phoneNumber: string
  telegram: string
  setPreview: Dispatch<SetStateAction<boolean>>
  setEmail: Dispatch<SetStateAction<string>>
  setTelegram: Dispatch<SetStateAction<string>>
  setPhone: Dispatch<SetStateAction<string>>
} & Pick<
  NotifiClientReturnType,
  | 'createAlert'
  | 'logIn'
  | 'fetchData'
  | 'data'
  | 'isAuthenticated'
  | 'updateAlert'
  | 'getConfiguration'
>

const NotificationsCard = ({
  createAlert,
  data,
  email,
  getConfiguration,
  isAuthenticated,
  logIn,
  onBackClick,
  phoneNumber,
  setEmail,
  setPhone,
  setPreview,
  setTelegram,
  telegram,
  updateAlert,
}: NotificationCardProps) => {
  const [isLoading, setLoading] = useState<boolean>(false)
  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(false)

  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)

  const alerts = data?.alerts
  const sources = data?.sources

  const [localEmail, setLocalEmail] = useState<string>('')
  const [localPhoneNumber, setLocalPhone] = useState<string>('')
  const [localTelegram, setLocalTelegram] = useState<string>('')

  const updateTelegramSupported = useCallback(async () => {
    const { supportedTargetTypes } = await getConfiguration()
    const telegram = supportedTargetTypes.find((it) => it === 'TELEGRAM')
    setTelegramEnabled(telegram !== undefined)
  }, [getConfiguration, setTelegramEnabled])

  useEffect(() => {
    updateTelegramSupported().catch((e) => {
      console.error('Failed to get supported type information: ', e)
    })
  }, [updateTelegramSupported])

  useEffect(() => {
    const targetGroup = firstOrNull(data?.targetGroups)

    if (email || telegram || phoneNumber) {
      setLocalEmail(email ?? '')
      setLocalTelegram(telegram ?? '')
      setLocalPhone(phoneNumber ?? '')
      setUnsavedChanges(true)
    } else if (targetGroup) {
      setLocalEmail(firstOrNull(targetGroup?.emailTargets)?.emailAddress ?? '')
      setLocalPhone(firstOrNull(targetGroup?.smsTargets)?.phoneNumber ?? '')
      setLocalTelegram(
        firstOrNull(targetGroup?.telegramTargets)?.telegramId ?? ''
      )
      setUnsavedChanges(true)
    } else {
      setLocalEmail(firstOrNull(data?.emailTargets)?.emailAddress ?? '')
      setLocalPhone(firstOrNull(data?.smsTargets)?.phoneNumber ?? '')
      setLocalTelegram(firstOrNull(data?.telegramTargets)?.telegramId ?? '')
      setUnsavedChanges(true)
    }
  }, [
    data,
    data?.emailTargets,
    data?.smsTargets,
    data?.telegramTargets,
    email,
    phoneNumber,
    telegram,
  ])

  const checkTelegramUnconfirmed = useCallback((alertsResponse: Alert[]) => {
    const hasTelegramAlert = alertsResponse.find(
      (alert) => alert.targetGroup.telegramTargets.length >= 0
    )
    const target = hasTelegramAlert?.targetGroup.telegramTargets[0]

    if (target && !target.isConfirmed) {
      if (target.confirmationUrl) {
        window.open(target.confirmationUrl)
      }
    }

    return alertsResponse.some((alertResponse) =>
      alertResponse.targetGroup.telegramTargets.some(
        (target) => !target.isConfirmed
      )
    )
  }, [])

  const handleError = (errors: { message: string }[]) => {
    const error = errors.length > 0 ? errors[0] : null
    if (error instanceof GqlError) {
      setErrorMessage(
        `${error.message}: ${error.getErrorMessages().join(', ')}`
      )
    } else {
      setErrorMessage(error?.message ?? 'Unknown error')
    }
    setLoading(false)
  }

  const handleRefresh = useCallback(
    async function () {
      setLoading(true)
      setErrorMessage('')
      // user is not authenticated
      if (!isAuthenticated && wallet && wallet.publicKey) {
        try {
          await logIn((wallet as unknown) as MessageSigner)
        } catch (e) {
          handleError([e])
        }
        setLoading(false)
      }
      setLoading(false)
    },
    [setLoading, isAuthenticated, wallet, setErrorMessage, logIn]
  )

  const handleSave = useCallback(async () => {
    setLoading(true)
    if (!isAuthenticated && wallet && wallet.publicKey) {
      try {
        await logIn((wallet as unknown) as MessageSigner)
        setUnsavedChanges(true)
      } catch (e) {
        handleError([e])
      }
    }
    if (connected && isAuthenticated) {
      try {
        if (alerts && alerts.length >= 1) {
          const results: Alert[] = []

          for (const alert of alerts) {
            const alertRes = await updateAlert({
              alertId: alert.id ?? '',
              emailAddress: localEmail === '' ? null : localEmail,
              phoneNumber: isValidPhoneNumber(localPhoneNumber)
                ? localPhoneNumber
                : null,
              telegramId: localTelegram === '' ? null : localTelegram,
            })
            if (alertRes) {
              results.push(alertRes)
            }
          }
          if (results) {
            setEmail(
              results[0].targetGroup?.emailTargets[0]?.emailAddress ?? ''
            )
            setPhone(results[0].targetGroup?.smsTargets[0]?.phoneNumber ?? '')
            setTelegram(
              results[0].targetGroup?.telegramTargets[0]?.telegramId ?? ''
            )
            setPreview(true)
          }
          checkTelegramUnconfirmed(results)
          if (results) {
            setPreview(true)
          }
        } else {
          const results: Alert[] = []
          if (sources && sources.length >= 1) {
            for (const source of sources) {
              const filterId = source.applicableFilters[0].id
              const alertRes = await createAlert({
                emailAddress: localEmail === '' ? null : localEmail,
                filterId: filterId ?? '',
                name: `${source.name} notification`,
                phoneNumber: isValidPhoneNumber(localPhoneNumber)
                  ? localPhoneNumber
                  : null,
                sourceId: source?.id ?? '',
                telegramId: localTelegram === '' ? null : localTelegram,
              })
              if (alertRes) {
                results.push(alertRes)
              }
            }
          }
          if (telegram) {
            checkTelegramUnconfirmed(results)
          }
          if (results && results.length >= 1) {
            setPreview(true)
            setEmail(
              results[0].targetGroup?.emailTargets[0]?.emailAddress ?? ''
            )
            setPhone(results[0].targetGroup?.smsTargets[0]?.phoneNumber ?? '')
            setTelegram(
              results[0].targetGroup?.telegramTargets[0]?.telegramId ?? ''
            )
          }
        }
        setUnsavedChanges(false)
      } catch (e) {
        handleError([e])
      }
    }
    setLoading(false)
  }, [
    alerts,
    checkTelegramUnconfirmed,
    connected,
    createAlert,
    isAuthenticated,
    localEmail,
    localPhoneNumber,
    localTelegram,
    logIn,
    setEmail,
    setPhone,
    setPreview,
    setTelegram,
    sources,
    telegram,
    updateAlert,
    wallet,
  ])

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEmail(e.target.value)
    setUnsavedChanges(true)
  }

  const handlePhone = (input: string) => {
    setLocalPhone(input)
    setUnsavedChanges(true)
  }

  const handleTelegram = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTelegram(e.target.value)
    setUnsavedChanges(true)
  }

  const disabled =
    (isAuthenticated && !hasUnsavedChanges) ||
    (localEmail === '' && localTelegram === '' && localPhoneNumber === '') ||
    errorMessage !== ''

  return (
    <div className="bg-bkg-5 w-full p-4 md:p-6 rounded-lg">
      <div className="flex flex-row items-center align-center">
        <Button className="bg-transparent" onClick={onBackClick}>
          <ArrowLeftIcon className="w-6 h-6" fill="grey" />
        </Button>
        <NotifiFullLogo />
      </div>
      {!connected ? (
        <>
          <div className="text-sm items-center w-full text-center text-th-fgd-1">
            Connect wallet to see options
          </div>
        </>
      ) : (
        <>
          <div className="text-sm text-th-fgd-1 flex flex-row items-center justify-between mt-4">
            Get notifications for proposals, voting, and results. Add your email
            address, phone number, and/or Telegram.
          </div>
          <div className="min-h-[20px]">
            {errorMessage.length > 0 ? (
              <div className="text-sm text-red">{errorMessage}</div>
            ) : (
              !isAuthenticated && (
                <div className="text-sm text-fgd-3">
                  When prompted, sign the transaction.
                </div>
              )
            )}
          </div>
          <div className="pb-5 -mt-2">
            <InputRow
              icon={
                <MailIcon className="z-10 h-10 text-primary-light w-7 mr-1 mt-9 absolute left-3.5" />
              }
              label="email"
            >
              <Input
                className="min-w-11/12 py-3 px-4 appearance-none w-11/12 pl-14 outline-0 focus:outline-none"
                onChange={handleEmail}
                placeholder="you@email.com"
                type="email"
                value={localEmail}
              />
            </InputRow>
            <PhoneInput
              handlePhone={handlePhone}
              phoneNumber={localPhoneNumber}
              setErrorMessage={setErrorMessage}
            />
            {telegramEnabled && (
              <InputRow
                icon={
                  <PaperAirplaneIcon
                    className="z-10 h-10 text-primary-light w-7 mr-1 mt-8 absolute left-3"
                    style={{ transform: 'rotate(45deg)' }}
                  />
                }
                label="Telegram"
              >
                <Input
                  className="min-w-11/12 py-3 px-4 appearance-none w-11/12 pl-14 outline-0 focus:outline-none flex"
                  onChange={handleTelegram}
                  placeholder="Telegram ID"
                  type="text"
                  value={localTelegram}
                />
              </InputRow>
            )}
          </div>
          <div className=" text-xs  place-items-center  align-items-center grid flex-row text-center">
            <div className="w-full place-items-center ">
              Already Subscribed?{' '}
              <a
                className="text-xs text-blue cursor-pointer "
                onClick={handleRefresh}
                rel="noreferrer"
                title="Click here to load your alert details."
              >
                Click here to load your alert details.
              </a>
            </div>
          </div>
          <div className="flex flex-col space-y-4 mt-4 items-center justify-content-center align-items-center">
            <Button
              className="w-11/12"
              disabled={disabled}
              isLoading={isLoading}
              onClick={handleSave}
              tooltipMessage={
                disabled
                  ? 'No unsaved changes!'
                  : isAuthenticated
                  ? 'Save settings for notifications'
                  : 'Fetch stored values for existing accounts'
              }
            >
              {alerts && alerts.length > 0 ? 'Update' : 'Subscribe'}
            </Button>

            <div className="h-3 grid text-xs w-full place-items-center">
              <a
                className="text-xs text-blue "
                href="https://www.notifi.network/faqs"
                rel="noreferrer"
                target="_blank"
                title="Questions? Click to learn more!"
              >
                Learn More About Notifi
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface InputRowProps {
  label: string
  icon: React.ReactNode
}

export const InputRow: FunctionComponent<InputRowProps> = ({
  children,
  icon,
  label,
}) => {
  return (
    <label
      className="relative text-gray-400 focus-within:text-gray-600 place-items-center left-5"
      htmlFor={label}
    >
      {icon}
      <div className="mr-2 text-sm w-40 h-8 flex items-center"></div>
      {children}
    </label>
  )
}

export default NotificationsCard
