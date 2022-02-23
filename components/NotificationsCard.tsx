import useRealm from '../hooks/useRealm'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'
import Input from './inputs/Input'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  ChatAltIcon,
  MailIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/solid'
import {
  useCreateAlert,
  useCreateEmailTarget,
  useCreateSmsTarget,
  useCreateTargetGroup,
  useCreateTelegramTarget,
  useGetFilters,
  useGetSourceGroups,
  useGetTargetGroups,
  useLoginFromDao,
  useNotifiJwt,
  useUpdateTargetGroup,
} from '@notifi-network/notifi-react-hooks'

function bufferToBase64(buf) {
  const binstr = Array.prototype.map
    .call(buf, function (ch) {
      return String.fromCharCode(ch)
    })
    .join('')
  return btoa(binstr)
}

const NotificationsCard = () => {
  const { councilMint, mint, realm } = useRealm()
  const [isLoading, setLoading] = useState<boolean>(false)
  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [telegram, setTelegram] = useState<string>('')
  const [sourceGroup, setSourceGroup] = useState<string>('')
  const [filter, setFilter] = useState<string>('')
  const [targetGroup, setTargetGroup] = useState<string>('')
  const [storedEmail, setStoredEmail] = useState<string>('')
  const [storedSms, setStoredSms] = useState<string>('')
  const [storedTelegram, setStoredTelegram] = useState<string>('')
  const [storedEmailId, setStoredEmailId] = useState<string>('')
  const [storedSmsId, setStoredSmsId] = useState<string>('')
  const [storedTelegramId, setStoredTelegramId] = useState<string>('')
  const enableTelegramInput = false

  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)

  const getTargetGroups = useGetTargetGroups()
  const getExistingTargetGroup = useCallback(() => {
    getTargetGroups()
      .then((resp) => {
        const targetGroup = resp[0]
        console.log(targetGroup)
        if (targetGroup != null) {
          setTargetGroup(targetGroup.id ?? '')
          if (targetGroup.emailTargets.length > 0) {
            const emailTarget = targetGroup.emailTargets[0]
            setEmail(emailTarget.emailAddress ?? '')
            setStoredEmail(emailTarget.emailAddress ?? '')
            setStoredEmailId(emailTarget.id ?? '')
          }
          if (targetGroup.smsTargets.length > 0) {
            const smsTarget = targetGroup.smsTargets[0]
            setPhone(smsTarget.phoneNumber ?? '')
            setStoredSms(smsTarget.phoneNumber ?? '')
            setStoredSmsId(smsTarget.id ?? '')
          }
          if (targetGroup.telegramTargets.length > 0) {
            const telegramTarget = targetGroup.telegramTargets[0]
            setTelegram(telegramTarget.telegramId ?? '')
            setStoredTelegram(telegramTarget.telegramId ?? '')
            setStoredTelegramId(telegramTarget.id ?? '')
          }
        }
      })
      .catch((err) => {
        console.log('Request failed: ' + JSON.stringify(err))
      })
  }, [getTargetGroups])

  const getSourceGroups = useGetSourceGroups()
  const getSourceGroup = useCallback(() => {
    getSourceGroups()
      .then((resp) => {
        const sourceGroup = resp[0]
        console.log(sourceGroup)
        setSourceGroup(sourceGroup.id ?? '')
      })
      .catch((err) => {
        console.log('Request failed: ' + JSON.stringify(err))
      })
  }, [getSourceGroups])

  const getFilters = useGetFilters()
  const getFilter = useCallback(() => {
    getFilters()
      .then((resp) => {
        const filter = resp[0]
        console.log(filter)
        setFilter(filter.id ?? '')
      })
      .catch((err) => {
        console.log('Request failed: ' + JSON.stringify(err))
      })
  }, [getFilters])

  const doCreateAlert = useCreateAlert()
  const createAlert = (tgId: string) => {
    doCreateAlert({
      sourceGroupId: sourceGroup,
      filterId: filter,
      targetGroupId: tgId,
    })
      .then((resp) => {
        // TODO: find out why we set filter here
        const filter = resp.filter[0]
        console.log(filter)
        setFilter(filter.id ?? '')
      })
      .catch((err) => {
        console.log('Request failed: ' + JSON.stringify(err))
      })
  }

  const doCreateEmailTarget = useCreateEmailTarget()
  const createEmailTarget = async (): Promise<string> => {
    const emailTarget = await doCreateEmailTarget({
      name: email,
      value: email,
    })

    console.log('createEmailTarget: ' + emailTarget.id)
    setStoredEmailId(emailTarget.id ?? '')

    return emailTarget.id!
  }

  const doCreateSmsTarget = useCreateSmsTarget()
  const createSmsTarget = async (): Promise<string> => {
    const smsTarget = await doCreateSmsTarget({
      name: phone,
      value: phone,
    })

    console.log(smsTarget)
    return smsTarget.id!
  }

  const doCreateTelegramTarget = useCreateTelegramTarget()
  const createTelegramTarget = async (): Promise<string> => {
    const telegramTarget = await doCreateTelegramTarget({
      name: telegram,
      value: telegram,
    })

    console.log(telegramTarget)

    const telegramLink =
      'https://t.me/NotifiNetworkBot?start=' + telegramTarget.telegramId!
    setTelegram(telegramLink)
    setStoredTelegram(telegramLink)
    window.open(telegramLink)

    return telegramTarget.id!
  }

  const doUpdateTargetGroup = useUpdateTargetGroup()
  const updateTargetGroup = async function (
    emailId: string,
    smsId: string,
    telegramId: string
  ): Promise<string> {
    const emailTargetIds: string[] = []
    if (emailId !== '') {
      emailTargetIds.push(emailId)
    }

    const smsTargetIds: string[] = []
    if (smsId !== '') {
      smsTargetIds.push(smsId)
    }

    const telegramTargetIds: string[] = []
    if (telegramId !== '') {
      telegramTargetIds.push(telegramId)
    }

    const resp = await doUpdateTargetGroup({
      targetGroupId: targetGroup,
      name: `${realm?.account.name} notifications`,
      emailTargetIds,
      smsTargetIds,
      telegramTargetIds,
    })

    console.log(resp)
    return resp.id!
  }

  const createTargetGroup = useCreateTargetGroup()
  const createNewTargetGroup = async function (
    emailId: string,
    smsId: string,
    telegramId: string
  ): Promise<string> {
    const emailTargetIds: string[] = []
    if (emailId !== '') {
      emailTargetIds.push(emailId)
    }

    const smsTargetIds: string[] = []
    if (smsId !== '') {
      smsTargetIds.push(smsId)
    }

    const telegramTargetIds: string[] = []
    if (telegramId !== '') {
      telegramTargetIds.push(telegramId)
    }

    const resp = await createTargetGroup({
      name: `${realm?.account.name} notifications`,
      emailTargetIds,
      smsTargetIds,
      telegramTargetIds,
    })

    console.log(resp)
    return resp.id!
  }

  const handleError = (errors: { message: string }[]) => {
    const message = errors.length > 0 ? errors[0]?.message : 'Unknown error'
    setErrorMessage(message)
    setLoading(false)
  }

  const { jwtRef, setJwt } = useNotifiJwt()
  const logInFromDao = useLoginFromDao()
  const handleSave = async function () {
    setLoading(true)
    // user is not authenticated
    if (!jwtRef.current && wallet && wallet.publicKey) {
      console.log(wallet)
      console.log(jwtRef.current)
      const ticks = Math.round(Date.now() / 1000)
      const p = await (wallet as any).signMessage(
        new TextEncoder().encode(
          `${wallet?.publicKey}` + realm?.pubkey + ticks.toString()
        ),
        'utf8'
      )

      try {
        const resp = logInFromDao({
          walletPublicKey: wallet.publicKey.toString(),
          daoAddress: realm?.pubkey.toBase58() || '',
          timestamp: ticks,
          signature: bufferToBase64(p),
        })

        console.log(resp)

        getExistingTargetGroup()
        getFilter()
        getSourceGroup()
      } catch (e) {
        handleError([e])
      }
      setLoading(false)
    }

    if (connected && jwtRef.current) {
      console.log('Sending')
      console.log(email)
      console.log(storedEmail)
      console.log(storedEmailId)
      let emailId = storedEmailId
      let smsId = storedSmsId
      let telegramId = storedTelegramId
      try {
        if (email != storedEmail) {
          console.log('creating email')
          emailId = await createEmailTarget()
          setStoredEmailId(emailId)
        }

        if (phone != storedSms) {
          smsId = await createSmsTarget()
          setStoredSmsId(smsId)
        }

        if (telegram != storedTelegram) {
          telegramId = await createTelegramTarget()
          setStoredTelegramId(telegramId)
        }

        if (targetGroup) {
          // Update
          console.log('updating target group')
          await updateTargetGroup(emailId, smsId, telegramId)
        } else {
          // New
          console.log('creating new target group')
          const tgId = await createNewTargetGroup(emailId, smsId, telegramId)
          setTargetGroup(tgId)
          console.log('creating new alert')
          await createAlert(tgId)
        }
      } catch (e) {
        setJwt(null)
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

  useEffect(() => {
    if (connected && jwtRef.current != null) {
      getExistingTargetGroup()
      getFilter()
      getSourceGroup()
    }
  }, [jwtRef, connected])

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
                !jwtRef.current && (
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

            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4 justify-end">
              {hasUnsavedChanges && (
                <Button
                  tooltipMessage="Save settings for notifications"
                  className="sm:w-1/2"
                  disabled={!hasUnsavedChanges}
                  onClick={handleSave}
                  isLoading={isLoading}
                >
                  Save
                </Button>
              )}
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
