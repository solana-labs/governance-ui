import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import cx from '@hub/lib/cx';

import { Logo } from './Logo';
import { UserDropdown } from './UserDropdown';

interface Props {
  className?: string;
}

export function GlobalHeader(props: Props) {
  return (
    <NavigationMenu.Root
      className={cx(
        props.className,
        'backdrop-blur-2xl',
        'bg-white/80',
        'flex',
        'items-center',
        'justify-center',
      )}
      style={{
        paddingRight: 'var(--removed-body-scroll-bar-size)',
      }}
    >
      <div className={cx('w-full')}>
        <NavigationMenu.List
          className={cx(
            'flex',
            'items-center',
            'justify-between',
            'max-w-screen-2xl',
            'mx-auto',
            'pl-6',
            'pr-3',
            'w-full',
          )}
        >
          <Logo />
          <UserDropdown />
        </NavigationMenu.List>
      </div>
    </NavigationMenu.Root>
  );
}
