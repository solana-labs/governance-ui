import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';
import { useMediaQuery } from 'react-responsive';

import { MobileRealmSearchNavigation } from '@hub/components/MobileRealmSearchNavigation';
import { RealmSearchNavigation } from '@hub/components/RealmSearchNavigation';
import { useJWT } from '@hub/hooks/useJWT';
import cx from '@hub/lib/cx';

import { CreateHub } from './CreateHub';
import { Links } from './Links';
import { LinksDropdown } from './LinksDropdown';
import { Logo } from './Logo';
import { User } from './User';

interface Props {
  className?: string;
}

export function GlobalHeader(props: Props) {
  const [jwt] = useJWT();
  const showCreateHub = useMediaQuery({ query: '(min-width: 1140px)' });
  const displayLinkRow = useMediaQuery({
    query: jwt ? '(min-width: 1230px)' : '(min-width: 966px)',
  });
  const showDesktopRealmSelector = useMediaQuery({
    query: '(min-width: 770px)',
  });
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
            {showDesktopRealmSelector && (
              <NavigationMenu.Item asChild>
                <RealmSearchNavigation className="ml-4" />
              </NavigationMenu.Item>
            )}
            {displayLinkRow ? (
              <Links
                className="ml-16"
                links={[
                  ...(jwt
                    ? [
                        {
                          href: '/feed',
                          title: 'My Feed',
                        },
                      ]
                    : []),
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
            ) : (
              <LinksDropdown
                className={cx(
                  'z-50',
                  showExpandedUserDropdown ? 'ml-8' : 'ml-2',
                )}
                links={[
                  ...(jwt
                    ? [
                        {
                          href: '/feed',
                          title: 'My Feed',
                        },
                      ]
                    : []),
                  {
                    href: '/ecosystem',
                    title: 'Ecosystem',
                  },
                  {
                    href: '/discover',
                    title: 'Discover',
                  },
                ]}
              />
            )}
          </div>
          <div className="flex items-center">
            <>
              {showCreateHub && <CreateHub className="mr-4" />}
              {!showDesktopRealmSelector && (
                <NavigationMenu.Item asChild>
                  <MobileRealmSearchNavigation />
                </NavigationMenu.Item>
              )}
            </>
            <User compressed={!showExpandedUserDropdown} />
          </div>
        </NavigationMenu.List>
      </div>
    </NavigationMenu.Root>
  );
}
