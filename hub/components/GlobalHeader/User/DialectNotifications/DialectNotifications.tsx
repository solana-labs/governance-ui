import {
  DialectSolanaSdk,
  DialectSolanaWalletAdapter,
  SolanaConfigProps,
} from '@dialectlabs/react-sdk-blockchain-solana';
import {
  ConfigProps,
  DialectThemeProvider,
  DialectUiManagementProvider,
  NotificationsButton,
} from '@dialectlabs/react-ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useMemo, useState } from 'react';

import { REALMS_PUBLIC_KEY, themeVariables } from './Notifications.constants';
import { solanaWalletToDialectWallet } from './solanaWalletToDialectWallet';

interface Props {
  className?: string;
}

export const DialectNotifications = (props: Props) => {
  const wallet = useWallet();

  const [
    dialectSolanaWalletAdapter,
    setDialectSolanaWalletAdapter,
  ] = useState<DialectSolanaWalletAdapter | null>(null);

  useEffect(() => {
    setDialectSolanaWalletAdapter(solanaWalletToDialectWallet(wallet));
  }, [wallet]);

  const dialectConfig = useMemo(
    (): ConfigProps => ({
      environment: 'production',
      dialectCloud: {
        tokenStore: 'local-storage',
      },
    }),
    [],
  );

  const solanaConfig: SolanaConfigProps = useMemo(
    () => ({
      wallet: dialectSolanaWalletAdapter,
    }),
    [dialectSolanaWalletAdapter],
  );

  // Uncomment when theme will be available for hub components
  // const [theme, setTheme] = useState<ThemeType>('light');
  // useEffect(() => {
  //   if (
  //     window.matchMedia &&
  //     window.matchMedia('(prefers-color-scheme: dark)').matches
  //   ) {
  //     setTheme('dark');
  //   } else {
  //     setTheme('light');
  //   }
  //   window
  //     .matchMedia('(prefers-color-scheme: dark)')
  //     .addEventListener('change', (event) => {
  //       const newColorScheme = event.matches ? 'dark' : 'light';
  //       setTheme(newColorScheme);
  //     });
  // }, []);

  return (
    <NavigationMenu.Item
      className={props.className}
      onClick={() => {
        if (!wallet.connected) {
          wallet.connect();
        }
      }}
    >
      <DialectSolanaSdk config={dialectConfig} solanaConfig={solanaConfig}>
        <DialectThemeProvider theme="light" variables={themeVariables}>
          <DialectUiManagementProvider>
            <NotificationsButton
              dialectId="dialect-notifications"
              dappAddress={REALMS_PUBLIC_KEY.toBase58()}
              pollingInterval={15000}
              channels={['web3', 'email', 'sms', 'telegram']}
            />
          </DialectUiManagementProvider>
        </DialectThemeProvider>
      </DialectSolanaSdk>
    </NavigationMenu.Item>
  );
};
