import useRealm from '../hooks/useRealm'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'
import Input from './inputs/Input'
import React, { FunctionComponent, useEffect, useState } from 'react'
import {
  ChatAltIcon,
  MailIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/solid'
import {
  BlockchainEnvironment,
  GqlError,
  MessageSigner,
  useNotifiClient,
} from '@notifi-network/notifi-react-hooks'
import { useRouter } from 'next/router'
import { EndpointTypes } from '@models/types'
import { useCallback } from 'react'

const firstOrNull = <T,>(
  arr: ReadonlyArray<T> | null | undefined
): T | null => {
  if (arr !== null && arr !== undefined) {
    return arr[0] ?? null
  }
  return null
}

const NotificationsCard = () => {
  const router = useRouter()
  const { cluster } = router.query
  const { councilMint, mint, realm } = useRealm()
  const [isLoading, setLoading] = useState<boolean>(false)
  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(false)

  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const endpoint = cluster ? (cluster as EndpointTypes) : 'mainnet'
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
  const {
    data,
    logIn,
    fetchData,
    isAuthenticated,
    createAlert,
    updateAlert,
    getConfiguration,
  } = useNotifiClient({
    dappAddress: realm?.pubkey?.toBase58() ?? '',
    walletPublicKey: wallet?.publicKey?.toString() ?? '',
    env,
  })

  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [telegram, setTelegram] = useState<string>('')

  const updateTelegramSupported = useCallback(async () => {
    const { supportedTargetTypes } = await getConfiguration()
    const telegram = supportedTargetTypes.find((it) => it === 'TELEGRAM')
    setTelegramEnabled(telegram !== undefined)
  }, [getConfiguration, setTelegramEnabled])

  useEffect(() => {
    // can't use async with useEffect
    updateTelegramSupported().catch((e) => {
      console.error('Failed to get supported type information: ', e)
    })
  }, [updateTelegramSupported])

  useEffect(() => {
    // Update state when server data changes
    const targetGroup = firstOrNull(data?.targetGroups)
    setEmail(firstOrNull(targetGroup?.emailTargets)?.emailAddress ?? '')
    setPhone(firstOrNull(targetGroup?.smsTargets)?.phoneNumber ?? '')
    setTelegram(firstOrNull(targetGroup?.telegramTargets)?.telegramId ?? '')
  }, [data])

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

  const handleRefresh = async function () {
    setLoading(true)
    setErrorMessage('')
    // user is not authenticated
    if (!isAuthenticated() && wallet && wallet.publicKey) {
      try {
        await logIn((wallet as unknown) as MessageSigner)
      } catch (e) {
        handleError([e])
      }
      setLoading(false)
    }
    setLoading(false)
  }

  const handleSave = async function () {
    setLoading(true)

    let localData = data
    // user is not authenticated
    if (!isAuthenticated() && wallet && wallet.publicKey) {
      try {
        await logIn((wallet as unknown) as MessageSigner)
        localData = await fetchData()
      } catch (e) {
        handleError([e])
      }
    }

    const alert = firstOrNull(localData?.alerts)
    const source = firstOrNull(localData?.sources)
    const filter = firstOrNull(localData?.filters)
    if (connected && isAuthenticated()) {
      try {
        if (alert !== null) {
          const alertResult = await updateAlert({
            alertId: alert.id ?? '',
            emailAddress: email === '' ? null : email,
            phoneNumber: phone.length < 12 ? null : phone,
            telegramId: telegram === '' ? null : telegram,
          })

          if (alertResult) {
            if (alertResult.targetGroup?.telegramTargets?.length > 0) {
              const target = alertResult.targetGroup?.telegramTargets[0]
              if (target && !target.isConfirmed) {
                console.log(target.confirmationUrl)
                window.open(target.confirmationUrl)
              }
            }
          }
        } else {
          const alertResult = await createAlert({
            name: `${realm?.account.name} notifications`,
            emailAddress: email === '' ? null : email,
            phoneNumber: phone.length < 12 ? null : phone,
            telegramId: telegram === '' ? null : telegram,
            sourceId: source?.id ?? '',
            filterId: filter?.id ?? '',
          })

          if (alertResult) {
            if (alertResult.targetGroup?.telegramTargets?.length > 0) {
              const target = alertResult.targetGroup?.telegramTargets[0]
              if (target && !target.isConfirmed) {
                console.log(target.confirmationUrl)
                window.open(target.confirmationUrl)
              }
            }
          }
        }
        setUnsavedChanges(false)
      } catch (e) {
        handleError([e])
      }
    }
    setLoading(false)
  }

  const hasLoaded = mint || councilMint

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setUnsavedChanges(true)
  }

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (val.length > 1) {
      val = val.substring(2)
    }

    const re = /^[0-9\b]+$/
    if (val === '' || (re.test(val) && val.length <= 10)) {
      setPhone('+1' + val)
    }

    setUnsavedChanges(true)
  }

  const handleTelegram = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelegram(e.target.value)
    setUnsavedChanges(true)
  }

  const disabled = isAuthenticated() && !hasUnsavedChanges

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg w-1/2">
      <h3 className="mb-4">Set up notifications</h3>
      {hasLoaded ? (
        !connected ? (
          <>
            <div className="text-sm text-th-fgd-1">
              Connect wallet to see options
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-sm text-th-fgd-1 flex flex-row items-center justify-between mt-4">
                Get notifications for proposals, voting, and results. Add your
                email address, phone number, and/or Telegram.
              </div>
              {errorMessage.length > 0 ? (
                <div className="text-sm text-red">{errorMessage}</div>
              ) : (
                !isAuthenticated() && (
                  <div className="text-sm text-fgd-3">
                    When prompted, sign the transaction.
                  </div>
                )
              )}
            </div>
            <InputRow
              label="E-mail"
              icon={<MailIcon className="h-8 text-primary-light w-4 mr-1" />}
            >
              <Input
                className="w-full min-w-full"
                type="email"
                value={email}
                onChange={handleEmail}
                placeholder="you@email.com"
              />
            </InputRow>

            <InputRow
              label="SMS"
              icon={<ChatAltIcon className="h-8 text-primary-light w-4 mr-1" />}
            >
              <Input
                className="w-full min-w-full"
                type="tel"
                value={phone}
                onChange={handlePhone}
                placeholder="+1 XXX-XXXX"
              />
            </InputRow>

            {telegramEnabled && (
              <InputRow
                label="Telegram"
                icon={
                  <PaperAirplaneIcon
                    className="mr-0 h-4 text-primary-light w-4"
                    style={{ transform: 'rotate(45deg)' }}
                  />
                }
              >
                <Input
                  className="w-full min-w-full"
                  type="text"
                  value={telegram}
                  onChange={handleTelegram}
                  placeholder="Telegram ID"
                />
              </InputRow>
            )}
            <div className="flex flex-col space-y-4 mt-4 items-start justify-start">
              <Button
                tooltipMessage={
                  disabled
                    ? 'No unsaved changes!'
                    : isAuthenticated()
                    ? 'Save settings for notifications'
                    : 'Fetch stored values for existing accounts'
                }
                className="sm:w-full"
                disabled={disabled}
                onClick={
                  hasUnsavedChanges || isAuthenticated()
                    ? handleSave
                    : handleRefresh
                }
                isLoading={isLoading}
              >
                {hasUnsavedChanges || isAuthenticated()
                  ? 'Subscribe'
                  : 'Refresh'}
              </Button>
              <div className="h-3 grid grid-cols-2 text-xs w-full">
                <div className="flex flex-row text-xs w-full">
                  Powered by&nbsp;
                  <NotifiLogo className="min-w-12 w-12 h-3 min-h-3" />
                </div>
                <div className="grid justify-items-end">
                  <a
                    href="https://www.notifi.network/faqs"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-dark"
                    title="Questions? Click to learn more!"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </>
        )
      ) : (
        <>
          <div className="animate-pulse bg-bkg-3 h-12 mb-4 rounded-lg" />
          <div className="animate-pulse bg-bkg-3 h-10 rounded-lg" />
        </>
      )}
    </div>
  )
}

interface InputRowProps {
  label: string
  icon: React.ReactNode
}

const InputRow: FunctionComponent<InputRowProps> = ({
  children,
  icon,
  label,
}) => {
  return (
    <div className="flex justify-between items-center content-center mt-4 w-full">
      <div className="mr-2 py-1 text-sm w-40 h-8 flex items-center">
        {icon}
        {label}
      </div>
      {children}
    </div>
  )
}

const NotifiLogo = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="61"
      height="14"
      viewBox="0 0 61 14"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.4546 8.12234C11.0641 8.23352 10.6519 8.29305 10.2258 8.29305C7.75286 8.29305 5.74812 6.28831 5.74812 3.81534C5.74812 3.37405 5.81196 2.94766 5.9309 2.54492H1.29125C0.57811 2.54492 0 3.12303 0 3.83617V12.7083C0 13.4214 0.57811 13.9995 1.29125 13.9995H10.1633C10.8765 13.9995 11.4546 13.4214 11.4546 12.7083V8.12234Z"
        fill="#F5F6FB"
      />
      <path
        d="M14.0004 3.18183C14.0004 4.93911 12.5758 6.36366 10.8186 6.36366C9.06127 6.36366 7.63672 4.93911 7.63672 3.18183C7.63672 1.42455 9.06127 0 10.8186 0C12.5758 0 14.0004 1.42455 14.0004 3.18183Z"
        fill="url(#paint0_linear_790_3397)"
      />
      <path
        d="M27.5799 9.07334V13.9039H29.5859V9.07334C29.5859 6.10438 28.0453 4.16251 25.6059 4.16251C24.4183 4.16251 23.3591 4.86865 23.0061 5.8476V4.27485H21V13.9039H23.0061V9.08939C23.0061 7.38825 23.9529 6.16857 25.2528 6.16857C26.6651 6.16857 27.5799 7.30801 27.5799 9.07334Z"
        fill="#F5F6FB"
      />
      <path
        d="M30.9267 9.07334C30.9267 11.8658 32.9969 14.0002 35.661 14.0002C38.325 14.0002 40.3792 11.8658 40.3792 9.07334C40.3792 6.29696 38.325 4.16251 35.661 4.16251C32.9969 4.16251 30.9267 6.29696 30.9267 9.07334ZM35.661 6.16857C37.2016 6.16857 38.3732 7.42035 38.3732 9.07334C38.3732 10.7424 37.2016 11.9942 35.661 11.9942C34.1203 11.9942 32.9327 10.7424 32.9327 9.07334C32.9327 7.42035 34.1203 6.16857 35.661 6.16857Z"
        fill="#F5F6FB"
      />
      <path
        d="M43.2265 2.23669L42.745 4.27485H41.3167V6.16857H42.745V10.5979C42.745 12.9571 43.7079 13.9039 46.0028 13.9039H46.8374V11.9139H46.1954C45.2004 11.9139 44.7511 11.4806 44.7511 10.4856V6.16857H46.8374V4.27485H44.7511V2.23669H43.2265Z"
        fill="#F5F6FB"
      />
      <path
        d="M50.2386 13.9039V4.27485H48.2325V13.9039H50.2386Z"
        fill="#F5F6FB"
      />
      <path
        d="M60.5156 13.9039V4.27485H54.995V3.56872C54.995 2.57372 55.4443 2.12435 56.4393 2.12435H57.0813V0.150391H56.2467C53.9518 0.150391 52.9889 1.08121 52.9889 3.45638V4.27485H51.5766V6.16857H52.9889V13.9039H54.995V6.16857H58.5096V13.9039H60.5156Z"
        fill="#F5F6FB"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M49.0032 0C48.4363 0 48.2324 0.311122 48.2324 0.753594V2.3621H49.8052C50.3514 2.3621 50.5945 2.17089 50.5945 1.63162V0.753594C50.5945 0.2489 50.2615 0 49.7499 0H49.0032Z"
        fill="#F5F6FB"
      />
      <defs>
        <linearGradient
          id="paint0_linear_790_3397"
          x1="12.74"
          y1="0.49587"
          x2="9.68218"
          y2="6.36366"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FE7970" />
          <stop offset="1" stopColor="#FEB776" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default NotificationsCard
