import React from 'react'
import * as anchor from '@project-serum/anchor'
import {
  IncomingThemeVariables,
  NotificationsButton,
  defaultVariables,
} from '@dialectlabs/react-ui'
import { WalletType } from '@dialectlabs/react'
import { useTheme } from 'next-themes'
import useWalletStore from 'stores/useWalletStore'

const REALMS_PUBLIC_KEY = new anchor.web3.PublicKey(
  'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj'
)

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

export default function DialectNotificationsButton() {
  const { theme } = useTheme()
  const { current: wallet, connection } = useWalletStore()
  const cluster = connection.cluster

  return (
    <NotificationsButton
      wallet={wallet as unknown as WalletType}
      network={cluster as string}
      publicKey={REALMS_PUBLIC_KEY}
      theme={theme === 'Dark' ? 'dark' : 'light'}
      variables={themeVariables}
      notifications={[{ name: 'New proposals', detail: 'Event' }]}
    />
  )
}
