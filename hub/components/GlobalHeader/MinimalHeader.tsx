import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';
import { useMediaQuery } from 'react-responsive';

import cx from '@hub/lib/cx';

import { Logo } from './Logo';
import { User } from './User';

interface Props {
  className?: string;
}

export function MinimalHeader(props: Props) {
  const showExpandedUserDropdown = useMediaQuery({
    query: '(min-width: 550px)',
  });

  return (
    <NavigationMenu.Root
      className={cx(
        props.className,
        'bg-white',
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
          <div className={cx('flex', 'items-center')}>
            <Logo compressed={!showExpandedUserDropdown} />
          </div>
          <div className="flex items-center">
            <User compressed={!showExpandedUserDropdown} />
          </div>
        </NavigationMenu.List>
      </div>
    </NavigationMenu.Root>
  );
}
