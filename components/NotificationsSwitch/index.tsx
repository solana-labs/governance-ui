import Button from '@components/Button'
import NotifiIcon from '@components/NotifiIcon'
import { defaultVariables } from '@dialectlabs/react-ui'
import styled from '@emotion/styled'
import { Transition } from '@headlessui/react'
import { DeviceMobileIcon } from '@heroicons/react/outline'
import { BellIcon, KeyIcon, MailIcon } from '@heroicons/react/solid'

import { useEffect, useRef, useState } from 'react'
import useNotificationStore, { ModalStates } from 'stores/useNotificationStore'

import DialectNotificationsModal from '@components/DialectNotificationsModal'
import NotificationCardContainer from '@components/NotificationsCard/NotificationCardContainer'
import TelegramIcon from './TelegramIcon'

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
    channels: ['Wallet', 'Email', 'Text', 'Telegram'],
    description: `Get notifications when new proposals are created & when proposals are completed or canceled. By wallet, email, Telegram or text message.`,
    modalState: ModalStates.Dialect,
    name: 'Dialect',
  },
  {
    channels: ['Email', 'Text', 'Telegram', 'Notifi Center'],
    description: `
    Get notifications for proposals, voting, and results. Add your email address, phone number, and/or Telegram.`,
    modalState: ModalStates.Notifi,
    name: 'notifi',
  },
]

export default function NotificationsSwitch() {
  const { modalState, set: setNotificationStore } = useNotificationStore(
    (s) => s
  )

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
          <DialectNotificationsModal
            onModalClose={() => {
              setOpenModal(false)
            }}
            onBackClick={() =>
              setNotificationStore((state) => {
                state.modalState = ModalStates.Selection
              })
            }
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
