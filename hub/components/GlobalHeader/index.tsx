import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { RealmSearchNavigation } from '@hub/components/RealmSearchNavigation';
import cx from '@hub/lib/cx';

import { CreateHub } from './CreateHub';
import { Links } from './Links';
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
          <div className={cx('flex', 'items-center')}>
            <Logo />
            <NavigationMenu.Item asChild>
              <RealmSearchNavigation className="ml-4" />
            </NavigationMenu.Item>
            <Links
              className="ml-16"
              links={[
                {
                  href: '/ecosystem',
                  title: 'Ecosystem Feed',
                },
                {
                  href: '/discover',
                  title: 'Discover',
                },
              ]}
            />
          </div>
          <div className="flex items-center">
            <CreateHub className="mr-8" />
            <UserDropdown />
          </div>
        </NavigationMenu.List>
      </div>
    </NavigationMenu.Root>
  );
}
