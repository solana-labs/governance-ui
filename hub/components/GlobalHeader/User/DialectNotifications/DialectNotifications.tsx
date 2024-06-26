import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana';
import { NotificationsButton } from '@dialectlabs/react-ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export const REALMS_PUBLIC_KEY = new PublicKey(
  'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj',
);

interface Props {
  className?: string;
}

export const DialectNotifications = (props: Props) => {
  const wallet = useWallet();

  return (
    <NavigationMenu.Item
      className={props.className}
      onClick={() => {
        if (!wallet.connected) {
          wallet.connect();
        }
      }}
    >
      <DialectSolanaSdk dappAddress={REALMS_PUBLIC_KEY.toString()}>
        <NotificationsButton theme="light" />
      </DialectSolanaSdk>
    </NavigationMenu.Item>
  );
};
