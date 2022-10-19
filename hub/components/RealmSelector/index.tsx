import AddIcon from '@carbon/icons-react/lib/Add';
import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import CloseIcon from '@carbon/icons-react/lib/Close';
import { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import { TypeOf } from 'io-ts';
import { useEffect, useState } from 'react';

import { TypeaheadSelect } from '@hub/components/controls/TypeaheadSelect';
import { RealmIcon } from '@hub/components/RealmIcon';
import { useQuery } from '@hub/hooks/useQuery';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

type Realm = TypeOf<typeof gql.getRealmsListResp>['realmDropdownList'][number];

interface Props {
  className?: string;
  exclude?: PublicKey[];
  defaultSelected?: null | PublicKey;
  removable?: boolean;
  onChange?(realm: Realm): void;
  onRemove?(): void;
}

export function RealmSelector(props: Props) {
  const [result] = useQuery(gql.getRealmsListResp, {
    query: gql.getRealmsList,
  });
  const [selected, setSelected] = useState<Realm | null>(null);

  useEffect(() => {
    if (selected) {
      props.onChange?.(selected);
    }
  }, [selected]);

  useEffect(() => {
    const defaultSelected = props.defaultSelected;

    if (RE.isOk(result) && defaultSelected) {
      const selected = result.data.realmDropdownList.find((item) =>
        item.publicKey.equals(defaultSelected),
      );

      if (selected) {
        setSelected(selected);
      }
    }
  }, [RE.isOk(result)]);

  return pipe(
    result,
    RE.match(
      () => <div />,
      () => <div />,
      ({ realmDropdownList }) => {
        const choices = [
          {
            key: ECOSYSTEM_PAGE.toBase58(),
            value: {
              iconUrl: null,
              name: 'Solana Ecosystem',
              publicKey: ECOSYSTEM_PAGE,
            } as Realm,
          },
        ]
          .concat(
            realmDropdownList.map((item) => ({
              key: item.publicKey.toBase58(),
              value: item,
            })),
          )
          .filter((choice) => {
            if (!props.exclude) {
              return true;
            }

            const exclusions = props.exclude.map((e) => e.toBase58());
            return !exclusions.includes(choice.value.publicKey.toBase58());
          });

        return (
          <TypeaheadSelect
            className={props.className}
            choices={choices}
            filter={(text, choice) => {
              if (!text) {
                return true;
              }

              return choice.value.name
                .toLocaleLowerCase()
                .includes(text.toLocaleLowerCase());
            }}
            selected={
              selected?.publicKey.toBase58() ||
              props.defaultSelected?.toBase58()
            }
            renderItem={(choice) => (
              <div
                className={cx(
                  'gap-x-2',
                  'grid-cols-[16px,1fr]',
                  'grid',
                  'items-center',
                  'pl-2',
                  'pr-2',
                  'py-3',
                )}
              >
                <RealmIcon
                  className="h-4 w-4 text-[8px]"
                  iconUrl={choice.value.iconUrl}
                  name={choice.value.name}
                />
                <div className="text-sm text-neutral-900 truncate">
                  {choice.value.name}
                </div>
              </div>
            )}
            renderTrigger={(choice, isOpen) => (
              <div
                className={cx(
                  'group',
                  'items-center',
                  choice && 'pl-2',
                  choice && 'pr-2',
                  choice && 'py-3',
                  choice && 'max-w-[192px]',
                  choice && 'gap-x-2',
                  choice && 'grid',
                  choice && 'grid-cols-[16px,1fr,16px]',
                  !choice && 'bg-white',
                  !choice && 'flex',
                  !choice && 'justify-center',
                  !choice && 'rounded-full',
                  !choice && 'h-8 w-8',
                )}
              >
                {choice ? (
                  <>
                    <RealmIcon
                      className="h-4 w-4 text-[8px]"
                      iconUrl={choice.value.iconUrl}
                      name={choice.value.name}
                    />
                    <div className="text-sm text-neutral-900 truncate">
                      {choice?.value.name || 'Select'}
                    </div>
                    <div
                      className={cx(
                        'h-4',
                        'w-4',
                        'flex',
                        'items-center',
                        'justify-center',
                        props.removable && 'group-hover:hidden',
                        props.removable && 'group-hover:pointer-events-none',
                      )}
                    >
                      <ChevronDownIcon
                        className={cx(
                          'fill-neutral-700',
                          'h-3',
                          'transition-all',
                          'w-3',
                          isOpen && '-rotate-180',
                        )}
                      />
                    </div>
                    <div
                      className={cx(
                        'fill-neutral-700',
                        'h-4',
                        'hidden',
                        'items-center',
                        'justify-center',
                        'rounded-full',
                        'transition-colors',
                        'w-4',
                        'hover:bg-white',
                        'hover:fill-rose-500',
                        props.removable && 'group-hover:flex',
                      )}
                      onClick={(e) => {
                        console.log('hererere');
                        e.stopPropagation();
                        e.preventDefault();
                        props.onRemove?.();
                      }}
                    >
                      <CloseIcon className={cx('fill-inherit', 'h-3', 'w-3')} />
                    </div>
                  </>
                ) : (
                  <AddIcon className="fill-neutral-700 h-4 w-4" />
                )}
              </div>
            )}
            onChange={(choice) => setSelected(choice.value)}
          />
        );
      },
    ),
  );
}
