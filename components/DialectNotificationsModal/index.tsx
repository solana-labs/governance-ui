import {
  ConfigProps,
  defaultVariables,
  DialectThemeProvider,
  DialectUiManagementProvider,
  IncomingThemeVariables,
  Notifications,
} from '@dialectlabs/react-ui'
import {
  DialectSolanaSdk,
  DialectSolanaWalletAdapter,
  SolanaConfigProps,
} from '@dialectlabs/react-sdk-blockchain-solana'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import { web3 } from '@coral-xyz/anchor'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

const REALMS_PUBLIC_KEY = new web3.PublicKey(
  'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj'
)

const themeVariables: IncomingThemeVariables = {
  dark: {
    bellButton:
      '!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3',
    iconButton: `${defaultVariables.dark.iconButton} hover:opacity-100`,
    buttonLoading: `${defaultVariables.dark.buttonLoading} rounded-full min-h-[40px]`,
    adornmentButton: `${defaultVariables.dark.adornmentButton} !text-bkg-1 bg-primary-light border-primary-light font-bold rounded-full hover:bg-fgd-1 hover:opacity-100`,
    colors: {
      ...defaultVariables.dark.colors,
      bg: 'bg-bkg-1',
      toggleBackgroundActive: 'bg-primary-light',
    },
    textStyles: {
      input: 'text-black',
    },
    outlinedInput: `${defaultVariables.dark.outlinedInput} focus-within:border-primary-light`,
    disabledButton: `${defaultVariables.dark.disabledButton} border-primary-light font-bold rounded-full border-fgd-3 text-fgd-3 cursor-not-allowed`,
    modal: `${defaultVariables.dark.modal} bg-bkg-1 sm:border sm:border-fgd-4 shadow-md sm:rounded-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14 rounded-md`,
    secondaryDangerButton: `${defaultVariables.dark.secondaryDangerButton} rounded-full`,
  },
  light: {
    bellButton:
      '!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3',
    iconButton: `${defaultVariables.light.iconButton} hover:opacity-100`,
    buttonLoading: `${defaultVariables.dark.buttonLoading} rounded-full min-h-[40px]`,
    adornmentButton: `${defaultVariables.light.adornmentButton} bg-primary-light border-primary-light font-bold rounded-full hover:bg-fgd-1 hover:opacity-100`,
    colors: {
      ...defaultVariables.light.colors,
      toggleBackgroundActive: 'bg-primary-light',
    },
    textStyles: {
      input: `${defaultVariables.light.textStyles.input} text-fgd-1 placeholder:text-fgd-3`,
      body: `${defaultVariables.light.textStyles.body} text-fgd-1`,
    },
    outlinedInput: `${defaultVariables.light.outlinedInput} focus-within:border-primary-light`,
    modal: `${defaultVariables.light.modal} sm:border sm:rounded-md sm:border-fgd-4 sm:shadow-md`,
    modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14`,
    secondaryDangerButton: `${defaultVariables.light.secondaryDangerButton} rounded-full`,
  },
}

const solanaWalletToDialectWallet = (
  wallet?: SignerWalletAdapter
): DialectSolanaWalletAdapter | null => {
  if (!wallet || !wallet.connected || wallet.connecting || !wallet.publicKey) {
    return null
  }

  return {
    publicKey: wallet.publicKey!,
    // @ts-ignore
    signMessage: wallet?.signMessage
      ? // @ts-ignore
        (msg) => wallet.signMessage(msg)
      : undefined,

    signTransaction: wallet.signTransaction as any,
    signAllTransactions: wallet.signAllTransactions as any,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    diffieHellman: wallet.wallet?.adapter?._wallet?.diffieHellman
      ? async (pubKey: any) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return wallet.wallet?.adapter?._wallet?.diffieHellman(pubKey)
        }
      : undefined,
  }
}

interface DialectNotificationsModalProps {
  onBackClick?: () => void
  onModalClose: () => void
}

export default function DialectNotificationsModal(
  props: DialectNotificationsModalProps
) {
  const { theme } = useTheme()
  const wallet = useWalletOnePointOh()

  const [
    dialectSolanaWalletAdapter,
    setDialectSolanaWalletAdapter,
  ] = useState<DialectSolanaWalletAdapter | null>(() =>
    solanaWalletToDialectWallet(wallet)
  )

  useEffect(() => {
    setDialectSolanaWalletAdapter(solanaWalletToDialectWallet(wallet))
  }, [wallet])

  const dialectConfig = useMemo(
    (): ConfigProps => ({
      environment: 'production',
      dialectCloud: {
        tokenStore: 'local-storage',
      },
    }),
    []
  )

  const solanaConfig: SolanaConfigProps = useMemo(
    () => ({
      wallet: dialectSolanaWalletAdapter,
    }),
    [dialectSolanaWalletAdapter]
  )

  return (
    <DialectSolanaSdk solanaConfig={solanaConfig} config={dialectConfig}>
      <DialectThemeProvider
        theme={theme.toLowerCase()}
        variables={themeVariables}
      >
        <DialectUiManagementProvider>
          <Notifications
            dappAddress={REALMS_PUBLIC_KEY.toBase58()}
            pollingInterval={15000}
            onModalClose={props.onModalClose}
            onBackClick={props.onBackClick}
            channels={['web3', 'telegram', 'sms', 'email']}
          />
        </DialectUiManagementProvider>
      </DialectThemeProvider>
    </DialectSolanaSdk>
  )
}
