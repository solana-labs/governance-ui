import {
  Backend,
  Config,
  defaultVariables,
  DialectContextProvider,
  DialectThemeProvider,
  DialectWalletAdapter,
  IncomingThemeVariables,
  Notifications,
} from '@dialectlabs/react-ui'
import * as anchor from '@project-serum/anchor'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

const REALMS_PUBLIC_KEY = new anchor.web3.PublicKey(
  'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj'
)

const themeVariables: IncomingThemeVariables = {
  dark: {
    bellButton:
      '!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3',
    button: `${defaultVariables.dark.button} border-none bg-primary-light border-primary-light font-bold rounded-full hover:bg-fgd-1 hover:opacity-100`,
    buttonLoading: `${defaultVariables.dark.buttonLoading} rounded-full min-h-[40px]`,
    colors: {
      bg: 'bg-bkg-1',
      toggleBackgroundActive: 'bg-primary-light',
    },
    outlinedInput: `${defaultVariables.light.outlinedInput} focus-within:bg-bkg-3 focus-within:border-primary-light`,
    addormentButton: `${defaultVariables.dark.addormentButton} text-bkg-2 bg-primary-light hover:bg-fgd-1`,
    disabledButton: `${defaultVariables.dark.disabledButton} border-primary-light font-bold rounded-full border-fgd-3 text-fgd-3 cursor-not-allowed`,
    modal: `${defaultVariables.dark.modal} bg-bkg-1 sm:border sm:border-fgd-4 shadow-md sm:rounded-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14 rounded-md`,
    secondaryDangerButton: `${defaultVariables.dark.secondaryDangerButton} rounded-full`,
  },
  light: {
    bellButton:
      '!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3',
    button: `${defaultVariables.light.button} border-none bg-primary-light border-primary-light font-bold rounded-full hover:bg-fgd-1 hover:opacity-100`,
    buttonLoading: `${defaultVariables.light.buttonLoading} rounded-full min-h-[40px]`,
    colors: {
      bg: 'bg-bkg-1',
      toggleBackgroundActive: 'bg-primary-light',
    },
    textStyles: {
      input: `${defaultVariables.light.textStyles.input} text-fgd-1 placeholder:text-fgd-3`,
    },
    outlinedInput: `${defaultVariables.light.outlinedInput} focus-within:bg-bkg-3 focus-within:border-primary-light`,
    addormentButton: `${defaultVariables.dark.addormentButton} text-bkg-2 bg-primary-light`,
    modal: `${defaultVariables.light.modal} sm:border sm:rounded-md sm:border-fgd-4 sm:shadow-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14`,
    secondaryDangerButton: `${defaultVariables.light.secondaryDangerButton} rounded-full`,
  },
}

const walletToDialectWallet = (
  wallet?: SignerWalletAdapter
): DialectWalletAdapter => ({
  publicKey: wallet?.publicKey || undefined,
  connected:
    (wallet?.connected && !wallet?.connecting && Boolean(wallet?.publicKey)) ||
    false,
  // @ts-ignore
  signMessage: wallet?.signMessage
    ? // @ts-ignore
      (msg) => wallet.signMessage(msg)
    : undefined,
  signTransaction: wallet?.signTransaction
    ? (tx) => wallet.signTransaction(tx)
    : undefined,
  signAllTransactions: wallet?.signAllTransactions
    ? (txs) => wallet.signAllTransactions(txs)
    : undefined,
})

interface DialectNotificationsModalProps {
  onBackClick?: () => void
  onModalClose: () => void
}

export default function DialectNotificationsModal(
  props: DialectNotificationsModalProps
) {
  const { theme } = useTheme()
  const wallet = useWalletStore((s) => s.current)

  const [
    dialectWalletAdapter,
    setDialectWalletAdapter,
  ] = useState<DialectWalletAdapter>(() => walletToDialectWallet(wallet))

  useEffect(() => {
    setDialectWalletAdapter(walletToDialectWallet(wallet))
  }, [wallet])

  const dialectConfig = useMemo(
    (): Config => ({
      backends: [Backend.DialectCloud],
      environment: 'production',
      dialectCloud: {
        tokenStore: 'local-storage',
      },
    }),
    []
  )

  return (
    <DialectContextProvider
      wallet={dialectWalletAdapter}
      config={dialectConfig}
      dapp={REALMS_PUBLIC_KEY}
    >
      <DialectThemeProvider
        theme={theme.toLowerCase()}
        variables={themeVariables}
      >
        <Notifications
          notifications={[
            { name: 'New proposals', detail: 'On creation' },
            { name: 'Finished proposals', detail: 'On execution' },
          ]}
          pollingInterval={15000}
          onModalClose={props.onModalClose}
          onBackClick={props.onBackClick}
          channels={['web3', 'telegram', 'sms', 'email']}
        />
      </DialectThemeProvider>
    </DialectContextProvider>
  )
}
