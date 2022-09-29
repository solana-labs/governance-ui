import BookIcon from '@carbon/icons-react/lib/Book';
import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import LogoutIcon from '@carbon/icons-react/lib/Logout';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { useWallet } from '@solana/wallet-adapter-react';

import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { useJWT } from '@hub/hooks/useJWT';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

import { DropdownButton } from './DropdownButton';
import { User as UserModel } from './gql';

interface Props {
  className?: string;
  user: UserModel;
}

export function User(props: Props) {
  const [, setJwt] = useJWT();
  const { wallet } = useWallet();

  const username =
    props.user.civicInfo?.handle ||
    props.user.twitterInfo?.handle ||
    abbreviateAddress(props.user.publicKey);

  return (
    <NavigationMenu.Item>
      <NavigationMenu.Trigger
        className={cx(
          props.className,
          'cursor-pointer',
          'flex',
          'gap-x-1',
          'items-center',
          'justify-between',
          'py-2',
          'px-3',
          'rounded',
          'text-neutral-900',
          'transition-colors',
          'w-48',
          'active:bg-neutral-300',
          'hover:bg-neutral-200',
        )}
      >
        <div className="flex items-center space-x-2 flex-shrink truncate">
          <AuthorAvatar author={props.user} className="h-6 w-6 text-xs" />
          <div className="truncate flex-shrink">{username}</div>
        </div>
        <ChevronDownIcon className="h-4 w-4 fill-neutral-900 flex-shrink-0" />
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
