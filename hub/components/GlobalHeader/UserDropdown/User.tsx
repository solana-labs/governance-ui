import BookIcon from '@carbon/icons-react/lib/Book';
import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import FaceCoolIcon from '@carbon/icons-react/lib/FaceCool';
import LogoutIcon from '@carbon/icons-react/lib/Logout';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import { useJWT } from '@hub/hooks/useJWT';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

import { DropdownButton } from './DropdownButton';

interface Props {
  className?: string;
  publicKey: PublicKey;
}

export function User(props: Props) {
  const [, setJwt] = useJWT();
  const { wallet } = useWallet();

  return (
    <NavigationMenu.Item>
      <NavigationMenu.Trigger
        className={cx(
          props.className,
          'cursor-pointer',
          'flex',
          'items-center',
          'justify-center',
          'py-2',
          'rounded',
          'space-x-2',
          'text-neutral-900',
          'transition-colors',
          'w-48',
          'active:bg-neutral-300',
          'hover:bg-neutral-200',
        )}
      >
        <FaceCoolIcon className="h-6 w-6 fill-cyan-500" />
        <div>{abbreviateAddress(props.publicKey)}</div>
        <ChevronDownIcon className="h-4 w-4 fill-neutral-900" />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content
        className={cx(
          'absolute',
          'drop-shadow-lg',
          'bg-white',
          'overflow-hidden',
          'rounded',
          'w-48',
        )}
      >
        <NavigationMenu.Sub>
          <NavigationMenu.List>
            <DropdownButton
              onClick={() => {
                window.open('https://docs.realms.today/', '_blank');
              }}
            >
              <BookIcon />
              <div>Realms Docs</div>
            </DropdownButton>
            <DropdownButton onClick={() => setJwt(null)}>
              <LogoutIcon />
              <div className="flex items-center justify-between">
                <div>Sign out</div>
                {wallet && (
                  <img className="h-4 w-4" src={wallet.adapter.icon} />
                )}
              </div>
            </DropdownButton>
          </NavigationMenu.List>
        </NavigationMenu.Sub>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}
