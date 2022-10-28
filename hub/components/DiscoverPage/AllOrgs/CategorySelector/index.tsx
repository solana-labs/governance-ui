import CheckboxIcon from '@carbon/icons-react/lib/Checkbox';
import CheckboxCheckedFilledIcon from '@carbon/icons-react/lib/CheckboxCheckedFilled';
import CircleFilledIcon from '@carbon/icons-react/lib/CircleFilled';
import CloseIcon from '@carbon/icons-react/lib/Close';
import FilterIcon from '@carbon/icons-react/lib/Filter';
import RadioButtonIcon from '@carbon/icons-react/lib/RadioButton';
import * as Popover from '@radix-ui/react-popover';
import { cloneElement } from 'react';

import { getCategoryIcon, getCategoryName } from '@hub/components/OrgCategory';
import cx from '@hub/lib/cx';
import { RealmCategory } from '@hub/types/RealmCategory';

interface Props {
  className?: string;
  selected: RealmCategory[];
  onChange?(selected: RealmCategory[]): void;
}

export function CategorySelector(props: Props) {
  return (
    <Popover.Root>
      <div className={cx('flex', 'items-center', 'space-x-4', props.className)}>
        <Popover.Trigger
          className={cx(
            'bg-white',
            'flex',
            'h-10',
            'items-center',
            'justify-center',
            'rounded',
            'w-10',
          )}
        >
          <FilterIcon
            className={cx(
              'h-4',
              'w-4',
              props.selected.length ? 'fill-sky-500' : 'fill-neutral-700',
            )}
          />
        </Popover.Trigger>
        {props.selected.map((category) => {
          const icon = getCategoryIcon(category);
          const name = getCategoryName(category);

          return (
            <button
              className={cx(
                'bg-transparent',
                'flex',
                'group',
                'items-center',
                'space-x-1',
                'tracking-normal',
                'text-neutral-500',
              )}
              key={category}
              onClick={() => {
                props.onChange?.(props.selected.filter((s) => s !== category));
              }}
            >
              {cloneElement(icon, {
                className: cx(
                  icon.props.className,
                  'h-4',
                  'w-4',
                  'fill-current',
                ),
              })}
              <div className="text-sm">{name}</div>
              <CloseIcon
                className={cx(
                  'fill-current',
                  'h-4',
                  'transition-colors',
                  'w-4',
                  'group-hover:fill-rose-500',
                )}
              />
            </button>
          );
        })}
      </div>
      <Popover.Portal>
        <Popover.Content
          className="bg-transparent drop-shadow-2xl"
          align="start"
          sideOffset={4}
        >
          <button
            className={cx(
              'bg-white',
              'gap-x-4',
              'grid-cols-[16px,1fr]',
              'grid',
              'h-10',
              'items-center',
              'p-3',
              'rounded',
              'text-left',
              'tracking-normal',
              'transition-colors',
              'w-48',
              'hover:bg-neutral-200',
            )}
            onClick={() => props.onChange?.([])}
          >
            {props.selected.length ? (
              <RadioButtonIcon className="h-4 w-4 fill-neutral-500" />
            ) : (
              <CircleFilledIcon className="h-4 w-4 fill-sky-500" />
            )}
            <div className="text-sm text-neutral-900">All Categories</div>
          </button>
          <div className="bg-white mt-[1px] rounded overflow-hidden">
            {Object.values(RealmCategory).map((category) => {
              const icon = getCategoryIcon(category);
              const name = getCategoryName(category);

              return (
                <button
                  className={cx(
                    'bg-white',
                    'gap-x-4',
                    'grid-cols-[16px,1fr]',
                    'grid',
                    'h-10',
                    'items-center',
                    'p-3',
                    'text-left',
                    'tracking-normal',
                    'transition-colors',
                    'w-48',
                    'hover:bg-neutral-200',
                  )}
                  key={category}
                  onClick={() => {
                    if (props.selected.includes(category)) {
                      props.onChange?.(
                        props.selected.filter((s) => s !== category),
                      );
                    } else {
                      const newList = props.selected.concat(category);

                      if (
                        newList.length === Object.values(RealmCategory).length
                      ) {
                        props.onChange?.([]);
                      } else {
                        props.onChange?.(newList);
                      }
                    }
                  }}
                >
                  {props.selected.includes(category) ? (
                    <CheckboxCheckedFilledIcon className="h-4 w-4 fill-sky-500" />
                  ) : (
                    <CheckboxIcon className="h-4 w-4 fill-neutral-500" />
                  )}
                  <div className="grid grid-cols-[16px,1fr] gap-x-1 items-center">
                    {cloneElement(icon, {
                      className: cx(
                        icon.props.className,
                        'h-4',
                        'w-4',
                        'fill-neutral-900',
                      ),
                    })}
                    <div className="text-sm text-neutral-900">{name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
