import ChevronLeftIcon from '@carbon/icons-react/lib/ChevronLeft';
import SearchIcon from '@carbon/icons-react/lib/Search';
import * as Dialog from '@radix-ui/react-dialog';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import Link from 'next/link';
import { forwardRef, useState, useRef } from 'react';

import ecosystemIcon from '@hub/components/EcosystemHeader/icon.png';
import { RealmIcon } from '@hub/components/RealmIcon';
import * as gql from '@hub/components/RealmSearchNavigation/gql';
import { useQuery } from '@hub/hooks/useQuery';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

interface Props {
  className?: string;
}

export const MobileRealmSearchNavigation = forwardRef<HTMLButtonElement, Props>(
  function MobileRealmSearchNavigation(props, ref) {
    const [result] = useQuery(gql.getRealmsListResp, {
      query: gql.getRealmsList,
    });
    const [text, setText] = useState('');
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const options = pipe(
      result,
      RE.match(
        () => [],
        () => [],
        ({ realmDropdownList }) => {
          return [
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
                name: item.name,
                publicKey: item.publicKey,
                url: `/realm/${item.urlId}/hub`,
              })),
            )
            .filter((choice) => {
              if (!text) {
                return true;
              }

              return choice.name
                .toLocaleLowerCase()
                .includes(text.toLocaleLowerCase());
            });
        },
      ),
    );

    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          className={cx(
            'flex',
            'items-center',
            'justify-center',
            'p-2',
            'rounded',
            'transition-colors',
            'hover:bg-neutral-200',
          )}
          ref={ref}
        >
          <SearchIcon className="fill-neutral-700 h-6 w-6" />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cx(
              'backdrop-blur-sm',
              'bottom-0',
              'fixed',
              'left-0',
              'right-0',
              'top-0',
              'z-50',
            )}
          >
            <Dialog.Content className="w-full bg-white h-full grid grid-rows-[56px,1fr]">
              <div
                className={cx(
                  'border-b',
                  'border-neutral-100',
                  'gap-x-2',
                  'grid-cols-[24px,1fr]',
                  'grid',
                  'h-14',
                  'items-center',
                  'px-2',
                )}
              >
                <Dialog.Close>
                  <ChevronLeftIcon className="fill-neutral-900 h-6 w-6" />
                </Dialog.Close>
                <div className={cx('relative', 'w-full')}>
                  <input
                    autoFocus
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
                    )}
                    placeholder="Communities"
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.currentTarget.value)}
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
                    )}
                  />
                </div>
              </div>
              <div className="max-h-full overflow-y-auto">
                <div className="p-2 text-xs text-neutral-500">
                  {text ? 'Results' : 'All communities'}
                </div>
                <div>
                  {options.map((option, i) => (
                    <Link passHref href={option.url} key={option.key + i}>
                      <a
                        className={cx(
                          'flex',
                          'gap-x-2',
                          'grid-cols-[24px,1fr]',
                          'grid',
                          'items-center',
                          'p-2',
                          'transition-colors',
                          'w-full',
                          'hover:bg-neutral-200',
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
                        <div className="text-sm text-neutral-900">
                          {option.name}
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);
