import Button from '@components/Button'
import NotifiIcon from '@components/NotifiIcon'
import { WalletType } from '@dialectlabs/react'
import {
  defaultVariables,
  IncomingThemeVariables,
  NotificationsModal,
} from '@dialectlabs/react-ui'
import styled from '@emotion/styled'
import { Transition } from '@headlessui/react'
import { DeviceMobileIcon } from '@heroicons/react/outline'
import { BellIcon, KeyIcon, MailIcon } from '@heroicons/react/solid'

import * as anchor from '@project-serum/anchor'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import useNotificationStore from 'stores/useNotificationStore'
import { ModalStates } from 'stores/useNotificationStore'
import useWalletStore from 'stores/useWalletStore'

import TelegramIcon from './TelegramIcon'
import NotificationCardContainer from '@components/NotificationsCard/NotificationCardContainer'

const REALMS_PUBLIC_KEY = new anchor.web3.PublicKey(
  'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj'
)

export function useOutsideAlerter(
  ref: React.MutableRefObject<Element | null>,
  bellRef: React.MutableRefObject<Element | null>,
  setOpen: CallableFunction
) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref?.current.contains(event.target as Element) &&
        bellRef.current &&
        !bellRef?.current.contains(event.target as Element)
      ) {
        setOpen(false)
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, bellRef, setOpen])
}

const TagToIcon = {
  Email: <MailIcon className="float-left h-3 mr-1 w-3" />,
  NotifiCenter: <BellIcon className="float-left h-3 mr-1 w-3" />,
  Telegram: <TelegramIcon className="float-left h-3 mr-1 w-3" />,
  Text: <DeviceMobileIcon className="float-left h-3 mr-1 w-3" />,
  Wallet: <KeyIcon className="float-left h-3 mr-1 w-3" />,
}

type ChannelType = 'Wallet' | 'Email' | 'Text' | 'Telegram' | 'Notifi Center'

interface NotificationSolutionType {
  name: string
  channels: ChannelType[]
  description: string
  modalState: ModalStates
}

const NotificationSolutions: NotificationSolutionType[] = [
  {
    channels: ['Email', 'Text', 'Telegram', 'Notifi Center'],
    description: `
    Get notifications for proposals, voting, and results. Add your email address, phone number, and/or Telegram.`,
    modalState: ModalStates.Notifi,
    name: 'notifi',
  },
  {
    channels: ['Wallet', 'Email', 'Text', 'Telegram'],
    description: `Dialect is the first protocol for smart messaging -
    dynamic, composable dapp notifications and
    wallet-to-wallet chat`,
    modalState: ModalStates.Dialect,
    name: 'Dialect',
  },
]

const themeVariables: IncomingThemeVariables = {
  dark: {
    bellButton:
      '!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3',
    button: `${defaultVariables.dark.button} bg-primary-light border-primary-light font-bold rounded-full hover:bg-primary-dark`,
    buttonLoading: `${defaultVariables.dark.buttonLoading} rounded-full min-h-[40px]`,
    colors: {
      bg: 'bg-bkg-1',
      highlight: 'border border-fgd-4',
    },
    disabledButton: `${defaultVariables.dark.disabledButton} border-primary-light font-bold rounded-full border-fgd-3 text-fgd-3 cursor-not-allowed`,
    modal: `${defaultVariables.dark.modal} bg-bkg-1 sm:border sm:border-fgd-4 shadow-md sm:rounded-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14 rounded-md`,
    secondaryDangerButton: `${defaultVariables.dark.secondaryDangerButton} rounded-full`,
  },
  light: {
    bellButton:
      '!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3',
    button: `${defaultVariables.light.button} bg-primary-light border-primary-light font-bold rounded-full hover:bg-primary-dark`,
    buttonLoading: `${defaultVariables.light.buttonLoading} rounded-full min-h-[40px]`,
    colors: {
      bg: 'bg-bkg-1',
    },
    modal: `${defaultVariables.light.modal} sm:border sm:rounded-md sm:border-fgd-4 sm:shadow-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14`,
    secondaryDangerButton: `${defaultVariables.light.secondaryDangerButton} rounded-full`,
  },
}

export default function NotificationsSwitch() {
  const { theme } = useTheme()
  const router = useRouter()

  const { cluster } = router.query

  const { modalState, set: setNotificationStore } = useNotificationStore(
    (s) => s
  )

  const wallet = useWalletStore((s) => s.current)

  const wrapperRef = useRef(null)
  const bellRef = useRef(null)
  const [openModal, setOpenModal] = useState(false)
  useOutsideAlerter(wrapperRef, bellRef, setOpenModal)

  const StyledChannelName = styled.span`
    font-size: 0.8rem;
    white-space: nowrap;
  `

  const removeSpaces = (str: string): string => {
    return str.split(' ').join('')
  }

  const formatName = (str: string): string => {
    return str[0].toUpperCase() + str.substring(1)
  }

  const Tag = ({ channelName }: { channelName: ChannelType }) => {
    return (
      <span>
        <div className="flex rounded-full items-center bg-bkg-3 px-3 mr-2 text-sm">
          {TagToIcon[removeSpaces(channelName)]}
          <StyledChannelName>{channelName}</StyledChannelName>
        </div>
      </span>
    )
  }

  const NotificationBox = ({
    channels,
    description,
    modalState,
    name,
  }: NotificationSolutionType) => (
    <div className="w-full p-4">
      <div className="flex flex-col items-center bg-bkg-1 px-10 py-6 text-sm">
        <div className="flex w-full">
          {name === 'notifi' && <NotifiIcon />}
          <h2 className="inline-block">{name}</h2>
        </div>
        <div className="flex w-full items-start mb-4">
          {channels.map((channel) => (
            <Tag channelName={channel} key={channel} />
          ))}
        </div>

        <div className="flex w-full mb-2">
          <div>
            <p className="inline-block text-sm">{description}</p>
          </div>
        </div>

        <div className="flex w-full justify-center pt-3">
          <Button
            className="w-full"
            onClick={() =>
              setNotificationStore((state) => {
                state.modalState = modalState
              })
            }
          >
            Use {formatName(name)}
          </Button>
        </div>
      </div>
    </div>
  )

  const DialectBellIcon = defaultVariables.dark.icons.bell

  return (
    <div className="relative" ref={wrapperRef}>
      <Transition
        className={defaultVariables.dark.modalWrapper}
        show={openModal}
        {...defaultVariables.animations.popup}
      >
        {modalState === ModalStates.Selection && (
          <div className="w-fit h-fit bg-bkg-5 -top-4 right-0 absolute rounded-lg shadow-md">
            <div className="h-full flex flex-col items-center pt-4">
              <h2 className="mb-2 font-light">Realms Notifications</h2>
              {NotificationSolutions.map((solution) => (
                <NotificationBox
                  channels={solution.channels}
                  description={solution.description}
                  key={solution.name}
                  modalState={solution.modalState}
                  name={solution.name}
                />
              ))}
            </div>
          </div>
        )}

        {modalState === ModalStates.Dialect && (
          <NotificationsModal
            channels={['web3', 'email', 'sms', 'telegram']}
            network={cluster as string}
            notifications={[{ detail: 'Event', name: 'New proposals' }]}
            onBackClick={() =>
              setNotificationStore((state) => {
                state.modalState = ModalStates.Selection
              })
            }
            publicKey={REALMS_PUBLIC_KEY}
            theme={theme === 'Dark' ? 'dark' : 'light'}
            variables={themeVariables}
            wallet={wallet as unknown as WalletType}
          />
        )}
        {modalState === ModalStates.Notifi && (
          <NotificationCardContainer
            onBackClick={() =>
              setNotificationStore((state) => {
                state.modalState = ModalStates.Selection
              })
            }
          />
        )}
      </Transition>
      <button
        className="bg-bkg-2 default-transition flex items-center justify-center h-10 rounded-full w-10 hover:bg-bkg-3"
        onClick={() => setOpenModal(!openModal)}
        ref={bellRef}
      >
        <DialectBellIcon />
      </button>
    </div>
  )
}
