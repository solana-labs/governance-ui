import CloseIcon from '@carbon/icons-react/lib/Close';
import SearchIcon from '@carbon/icons-react/lib/Search';
import * as Popover from '@radix-ui/react-popover';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import { forwardRef, useEffect, useState, useRef } from 'react';

import { RealmIcon } from '@hub/components/RealmIcon';
import { useQuery } from '@hub/hooks/useQuery';
import { STEALTH_HUBS } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  className?: string;
  selected?: PublicKey;
  onSelect?(selected?: gql.Realm): void;
}

export const RealmSearchSelector = forwardRef<HTMLInputElement, Props>(
  function RealmSearchSelector(props, ref) {
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
        ({ realmDropdownList }) => {
          return {
            all: realmDropdownList
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

    useEffect(() => {
      if (props.selected) {
        const pk = props.selected;
        const selected = options.all.find((item) => item.publicKey.equals(pk));

        if (selected) {
          setText(selected.name);
        }
      }
    }, [props.selected]);

    return (
      <Popover.Root>
        <Popover.Anchor asChild ref={ref}>
          <div className={cx('relative', 'w-[270px]', props.className)}>
            <input
              className={cx(
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
              name="realm"
              placeholder="Communities"
              ref={inputRef}
              type="text"
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
              )}
            />
            <button
              className={cx(
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
                <div>
                  {options.all.map((option, i) => (
                    <div
                      className={cx(
                        'cursor-pointer',
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
                      key={i}
                      onClick={() => {
                        setText('');
                        setOpen(false);
                        props.onSelect?.(option);
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
                    </div>
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
