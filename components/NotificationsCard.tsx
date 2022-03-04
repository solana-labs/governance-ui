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

const NotificationsCard = () => {
  const { councilMint, mint, realm } = useRealm()
  const [isLoading, setLoading] = useState<boolean>(false)
  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const enableTelegramInput = false

  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const {
    data,
    logIn,
    isAuthenticated,
    updateAlert,
    fetchData,
  } = useNotifiClient({
    daoAddress: realm?.pubkey?.toBase58() ?? '',
    walletPublicKey: wallet?.publicKey?.toString() ?? '',
    env: BlockchainEnvironment.MainNetBeta,
  })
  const [email, setEmail] = useState<string>(data?.emailAddress ?? '')
  const [phone, setPhone] = useState<string>(data?.phoneNumber ?? '')
  const [telegram, setTelegram] = useState<string>(data?.telegramId ?? '')

  useEffect(() => {
    // Update state when server data changes
    setEmail(data?.emailAddress ?? '')
    setPhone(data?.phoneNumber ?? '')
    setTelegram(data?.telegramId ?? '')
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
    // user is not authenticated
    if (!isAuthenticated() && wallet && wallet.publicKey) {
      try {
        await logIn(wallet as MessageSigner)
      } catch (e) {
        handleError([e])
      }
      setLoading(false)
    }

    // Update fields
    if (connected && isAuthenticated()) {
      console.log('Refreshing values')
      try {
        const { emailAddress, phoneNumber, telegramId } = await fetchData()
        setEmail(emailAddress ?? '')
        setPhone(phoneNumber ?? '')
        setTelegram(telegramId ?? '')
      } catch (e) {
        handleError([e])
      }
    }
    setLoading(false)
  }

  const handleSave = async function () {
    setLoading(true)
    // user is not authenticated
    if (!isAuthenticated() && wallet && wallet.publicKey) {
      try {
        await logIn(wallet as MessageSigner)
      } catch (e) {
        handleError([e])
      }
    }

    if (connected && isAuthenticated()) {
      console.log('Sending')
      console.log(email)
      try {
        await updateAlert({
          name: `${realm?.account.name} notifications`,
          emailAddress: email === '' ? null : email,
          phoneNumber: phone.length < 12 ? null : phone,
          telegramId: telegram === '' ? null : telegram,
        })
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
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4">Notifications</h3>
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
                Notifi me on DAO Proposal Changes
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
              icon={<MailIcon className="mr-1.5 h-4 text-primary-light w-4" />}
            >
              <Input
                className="my-4"
                type="email"
                value={email}
                onChange={handleEmail}
                placeholder="you@email.com"
              />
            </InputRow>

            <InputRow
              label="SMS"
              icon={
                <ChatAltIcon className="mr-1.5 h-4 text-primary-light w-4" />
              }
            >
              <Input
                type="tel"
                value={phone}
                onChange={handlePhone}
                placeholder="+1 XXX-XXXX"
              />
            </InputRow>

            {enableTelegramInput && (
              <InputRow
                label="Telegram"
                icon={
                  <PaperAirplaneIcon
                    className="mr-1.5 h-4 text-primary-light w-4"
                    style={{ transform: 'rotate(45deg)' }}
                  />
                }
              >
                <Input
                  type="text"
                  value={telegram}
                  onChange={handleTelegram}
                  placeholder="Telegram ID"
                />
              </InputRow>
            )}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4 items-center justify-between">
              {
                <Button
                  tooltipMessage={
                    disabled
                      ? 'No unsaved changes!'
                      : isAuthenticated()
                      ? 'Save settings for notifications'
                      : 'Fetch stored values for existing accounts'
                  }
                  className="sm:w-1/2"
                  disabled={disabled}
                  onClick={
                    hasUnsavedChanges || isAuthenticated()
                      ? handleSave
                      : handleRefresh
                  }
                  isLoading={isLoading}
                >
                  {hasUnsavedChanges || isAuthenticated() ? 'Save' : 'Refresh'}
                </Button>
              }
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
    <div className="flex justify-between items-center content-center mt-4">
      <div className="mr-2 py-1 text-sm w-40 h-8 flex items-center">
        {icon}
        {label}
      </div>
      {children}
    </div>
  )
}

export default NotificationsCard
