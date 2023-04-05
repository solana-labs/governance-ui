import CloseIcon from '@carbon/icons-react/lib/Close';
import SearchIcon from '@carbon/icons-react/lib/Search';
import * as Popover from '@radix-ui/react-popover';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import Link from 'next/link';
import { forwardRef, useState, useRef } from 'react';

import ecosystemIcon from '@hub/components/EcosystemHeader/icon.png';
import { RealmIcon } from '@hub/components/RealmIcon';
import { useQuery } from '@hub/hooks/useQuery';
import { ECOSYSTEM_PAGE, STEALTH_HUBS } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  className?: string;
}

export const RealmSearchNavigation = forwardRef<HTMLInputElement, Props>(
  function RealmSearchNavigation(props, ref) {
    const [result] = useQuery(gql.getRealmsListResp, {
      query: gql.getRealmsList,
    });
    const [text, setText] = useState('');
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const options = pipe(
      result,
      RE.match(
        () => ({ following: [], all: [] }),
        () => ({ following: [], all: [] }),
        ({ me, realmDropdownList }) => {
          const followedRealms = me?.followedRealms || [];
          const followedRealmsPks = followedRealms.map((r) =>
            r.publicKey.toBase58(),
          );

          return {
            following: followedRealms
              .map((item) => ({
                key: item.publicKey.toBase58(),
                iconUrl: item.iconUrl,
                name: item.displayName || item.name,
                publicKey: item.publicKey,
                url: `/realm/${item.urlId}/hub`,
              }))
              .filter((choice) => {
                if (!text) {
                  return true;
                }

                return choice.name
                  .toLocaleLowerCase()
                  .includes(text.toLocaleLowerCase());
              }),
            all: [
              {
                key: ECOSYSTEM_PAGE.toBase58(),
                iconUrl: ecosystemIcon.src,
                name: 'Solana Ecosystem',
                publicKey: ECOSYSTEM_PAGE,
                url: '/ecosystem',
              } as {
                key: string;
                iconUrl: null | string;
                name: string;
                publicKey: PublicKey;
                url: string;
              },
            ]
              .concat(
                realmDropdownList.map((item) => ({
                  key: item.publicKey.toBase58(),
                  iconUrl: item.iconUrl,
                  name: item.displayName || item.name,
                  publicKey: item.publicKey,
                  url: `/realm/${item.urlId}/hub`,
                })),
              )
              .filter((item) => {
                if (followedRealmsPks.includes(item.publicKey.toBase58())) {
                  return false;
                }

                return true;
              })
              .filter((item) => {
                if (STEALTH_HUBS.has(item.publicKey.toBase58())) {
                  return false;
                }

                return true;
              })
              .filter((choice) => {
                if (!text) {
                  return true;
                }

                return choice.name
                  .toLocaleLowerCase()
                  .includes(text.toLocaleLowerCase());
              }),
          };
        },
      ),
    );

    return (
      <Popover.Root>
        <Popover.Anchor asChild ref={ref}>
          <div className={cx('relative', 'w-[270px]', props.className)}>
            <input
              className={cx(
                'bg-neutral-100',
                'border-neutral-200',
                'border',
                'px-10',
                'py-2.5',
                'rounded',
                'text-neutral-500',
                'text-sm',
                'transition-colors',
                'w-full',
                'placeholder:text-neutral-500',
                'placeholder:transition-colors',
                'focus:placeholder:text-neutral-300',
                'focus:outline-none',
                'dark:bg-neutral-900',
                'dark:border-neutral-700',
                'dark:placeholder:text-neutral-400',
                'dark:focus:placeholder:text-neutral-200',
              )}
              placeholder="Organizations"
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              onFocus={() => setOpen(true)}
            />
            <SearchIcon
              className={cx(
                '-translate-y-1/2',
                'absolute',
                'fill-neutral-900',
                'h-4',
                'left-4',
                'top-1/2',
                'w-4',
                'dark:fill-neutral-400',
              )}
            />
            <button
              className={cx(
                'dark:text-neutral-400',
                '-translate-y-1/2',
                'absolute',
                'focus:opacity-100',
                'focus:pointer-events-auto',
                'hover:text-neutral-500',
                'opacity-0',
                'pointer-events-none',
                'right-4',
                'text-neutral-900',
                'top-1/2',
                'transition-opacity',
                open && 'opacity-100',
                open && 'pointer-events-auto',
              )}
              onClick={() => {
                setText('');
                setOpen(true);
              }}
            >
              <CloseIcon
                className={cx(
                  'fill-current',
                  'transition-colors',
                  'h-4',
                  'w-4',
                )}
              />
            </button>
          </div>
        </Popover.Anchor>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              forceMount
              align="start"
              sideOffset={4}
              className={cx(
                'dark:bg-neutral-900',
                'drop-shadow-lg',
                'bg-white',
                'overflow-hidden',
                'rounded',
                'w-[270px]',
                'z-50',
              )}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={(e) => {
                if (e.currentTarget !== inputRef.current) {
                  setOpen(false);
                }
              }}
            >
              <div className="max-h-[350px] overflow-y-auto">
                {!!options.following.length && (
                  <>
                    <div className="p-2 text-xs text-neutral-500">
                      Following
                    </div>
                    <div>
                      {options.following.map((option, i) => (
                        <Link passHref href={option.url} key={option.key + i}>
                          <a
                            className={cx(
                              'flex',
                              'gap-x-2',
                              'grid-cols-[24px,1fr]',
                              'grid',
                              'group',
                              'items-center',
                              'p-2',
                              'transition-colors',
                              'w-full',
                              'hover:bg-neutral-200',
                              'dark:hover:bg-neutral-700',
                            )}
                            onClick={() => {
                              setText('');
                              setOpen(false);
                            }}
                          >
                            <RealmIcon
                              className="h-6 w-6"
                              iconUrl={option.iconUrl}
                              name={option.name}
                            />
                            <div
                              className={cx(
                                'text-sm',
                                'text-neutral-900',
                                'transition-colors',
                                'dark:text-neutral-400',
                                'dark:group-hover:text-neutral-200',
                              )}
                            >
                              {option.name}
                            </div>
                          </a>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
                <div className="p-2 text-xs text-neutral-500">
                  All communities
                </div>
                <div>
                  {options.all.map((option, i) => (
                    <Link passHref href={option.url} key={option.key + i}>
                      <a
                        className={cx(
                          'flex',
                          'gap-x-2',
                          'grid-cols-[24px,1fr]',
                          'grid',
                          'group',
                          'items-center',
                          'p-2',
                          'transition-colors',
                          'w-full',
                          'hover:bg-neutral-200',
                          'dark:hover:bg-neutral-700',
                        )}
                        onClick={() => {
                          setText('');
                          setOpen(false);
                        }}
                      >
                        <RealmIcon
                          className="h-6 w-6"
                          iconUrl={option.iconUrl}
                          name={option.name}
                        />
                        <div
                          className={cx(
                            'text-sm',
                            'text-neutral-900',
                            'transition-colors',
                            'dark:text-neutral-400',
                            'dark:group-hover:text-neutral-200',
                          )}
                        >
                          {option.name}
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </Popover.Root>
    );
  },
);
