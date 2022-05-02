import { useRef, useState } from 'react'
import * as anchor from '@project-serum/anchor'
import {
  IncomingThemeVariables,
  NotificationsModal,
  defaultVariables,
} from '@dialectlabs/react-ui'
import { WalletType } from '@dialectlabs/react'
import { Transition } from '@headlessui/react'
import { useTheme } from 'next-themes'
import useWalletStore from 'stores/useWalletStore'
import useNotificationStore from 'stores/useNotificationStore'
import { ModalStates } from 'stores/useNotificationStore'
import { BellIcon, KeyIcon, MailIcon } from '@heroicons/react/solid'
import { DeviceMobileIcon } from '@heroicons/react/outline'
import styled from '@emotion/styled'

const REALMS_PUBLIC_KEY = new anchor.web3.PublicKey(
  'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj'
)

const TagToIcon = {
  Wallet: <KeyIcon className="float-left h-3 mr-1 w-3" />,
  Email: <MailIcon className="float-left h-3 mr-1 w-3" />,
  Text: <DeviceMobileIcon className="float-left h-3 mr-1 w-3" />,
}

type ChannelType = 'Wallet' | 'Email' | 'Text'

interface NotificationSolutionType {
  name: string
  channels: ChannelType[]
  description: string
  modalState: ModalStates
}

const NotificationSolutions: NotificationSolutionType[] = [
  {
    name: 'Dialect',
    channels: ['Wallet', 'Email', 'Text'],
    description: `Dialect is the first protocol for smart messaging -
    dynamic, composable dapp notifications and
    wallet-to-wallet chat`,
    modalState: ModalStates.Dialect,
  },
]

const themeVariables: IncomingThemeVariables = {
  light: {
    colors: {
      bg: 'bg-bkg-1',
    },
    button: `${defaultVariables.light.button} bg-primary-light border-primary-light font-bold rounded-full hover:bg-primary-dark`,
    buttonLoading: `${defaultVariables.light.buttonLoading} rounded-full min-h-[40px]`,
    secondaryDangerButton: `${defaultVariables.light.secondaryDangerButton} rounded-full`,
    bellButton: `!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3`,
    modal: `${defaultVariables.light.modal} sm:border sm:rounded-md sm:border-fgd-4 sm:shadow-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14`,
  },
  dark: {
    colors: {
      bg: 'bg-bkg-1',
      highlight: 'border border-fgd-4',
    },
    button: `${defaultVariables.dark.button} bg-primary-light border-primary-light font-bold rounded-full hover:bg-primary-dark`,
    buttonLoading: `${defaultVariables.dark.buttonLoading} rounded-full min-h-[40px]`,
    secondaryDangerButton: `${defaultVariables.dark.secondaryDangerButton} rounded-full`,
    bellButton:
      '!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3',
    modal: `${defaultVariables.dark.modal} bg-bkg-1 sm:border sm:border-fgd-4 shadow-md sm:rounded-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14`,
  },
}

export default function NotificationsSwitch() {
  const { theme } = useTheme()
  const wrapperRef = useRef()
  const { current: wallet, connection } = useWalletStore()
  const cluster = connection.cluster
  const { modalState, set: setNotificationStore } = useNotificationStore(
    (s) => s
  )

  const [openModal, setOpenModal] = useState(false)

  const StyledChannelName = styled.span`
    font-size: 0.6rem;
  `

  const Tag = ({ channelName }: { channelName: ChannelType }) => (
    <span>
      <div className="flex rounded-full items-center bg-bkg-3 px-3 mr-2">
        {TagToIcon[channelName]}
        <StyledChannelName>{channelName}</StyledChannelName>
      </div>
    </span>
  )

  const NotificationBox = ({
    name,
    description,
    channels,
    modalState,
  }: NotificationSolutionType) => (
    <div className="w-full p-4">
      <div className="flex flex-col items-center bg-bkg-1 px-16 py-6">
        <div className="flex w-full justify-between">
          <div>
            <h2 className="inline-block">{name}</h2>
          </div>
          <div className="flex flex-row">
            {channels.map((channel) => (
              <Tag key={channel} channelName={channel} />
            ))}
          </div>
        </div>

        <div className="flex w-full justify-start">
          <div>
            <p className="inline-block">{description}</p>
          </div>
        </div>

        <div className="flex w-full justify-center pt-3">
          <button
            className="bg-white rounded-full py-3 w-full text-black"
            onClick={() =>
              setNotificationStore((state) => {
                state.modalState = modalState
              })
            }
          >
            Use {name}
          </button>
        </div>
      </div>
    </div>
  )

  const DialectBellIcon = defaultVariables.dark.icons.bell

  return (
    <div className="relative">
      <Transition
        className={defaultVariables.dark.modalWrapper}
        show={openModal}
        {...defaultVariables.animations.popup}
      >
        {modalState === ModalStates.Selection && (
          <div className="w-full h-full bg-bkg-3 absolute top-0 right-0">
            <div className="h-full flex flex-col items-center py-4">
              <BellIcon className="h-10 ml-2 w-10" />
              <h2 className="mb-4 pt-4 font-light">Realms Notifications</h2>
              {NotificationSolutions.map((solution) => (
                <NotificationBox
                  key={solution.name}
                  name={solution.name}
                  description={solution.description}
                  channels={solution.channels}
                  modalState={solution.modalState}
                />
              ))}
            </div>
          </div>
        )}

        {modalState === ModalStates.Dialect && (
          <NotificationsModal
            wallet={(wallet as unknown) as WalletType}
            network={cluster as string}
            publicKey={REALMS_PUBLIC_KEY}
            theme={theme === 'Dark' ? 'dark' : 'light'}
            variables={themeVariables}
            notifications={[{ name: 'New proposals', detail: 'Event' }]}
            onBackClick={() =>
              setNotificationStore((state) => {
                state.modalState = ModalStates.Selection
              })
            }
            channels={['web3', 'email', 'sms', 'telegram']}
          />
        )}
      </Transition>
      <button
        className="bg-bkg-2 default-transition flex items-center justify-center h-10 rounded-full w-10 hover:bg-bkg-3"
        onClick={() => setOpenModal(!openModal)}
      >
        <DialectBellIcon />
      </button>
    </div>
  )
}
