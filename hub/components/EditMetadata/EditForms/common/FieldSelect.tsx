import Checkmark from '@carbon/icons-react/lib/Checkmark';
import ChevronDown from '@carbon/icons-react/lib/ChevronDown';
import * as _Select from '@radix-ui/react-select';
import { ForwardedRef, forwardRef, ForwardRefRenderFunction } from 'react';

import cx from '@hub/lib/cx';

interface Choice<T> {
  key: string;
  label: string;
  value: T;
}

export interface Props<T> {
  className?: string;
  dropdownClassName?: string;
  choices: Choice<T>[];
  label: string;
  placeholder: string;
  selected?: string;
  onChange?(item: Choice<T>): void;
}

export interface FieldSelect {
  <T>(props: Props<T>, ref: HTMLButtonElement): ReturnType<
    ForwardRefRenderFunction<Props<T>, HTMLButtonElement>
  >;
}

export const FieldSelect: FieldSelect = forwardRef(function Select<T>(
  props: Props<T>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const selectedChoice = props.choices.find(
    (choice) => choice.key === props.selected,
  );

  return (
    <_Select.Root
      value={props.selected}
      onValueChange={(key) => {
        const item = props.choices.find((choice) => choice.key === key);

        if (item && props.onChange) {
          props.onChange(item);
        }
      }}
    >
      <div className={props.className}>
        <div className="text-sm text-neutral-700 mb-2">{props.label}</div>
        <_Select.Trigger
          className={cx(
            'bg-zinc-50',
            'border-zinc-300',
            'border',
            'flex',
            'group',
            'h-14',
            'items-center',
            'justify-between',
            'outline-none',
            'px-3',
            'rounded-md',
            'space-x-2',
            'tracking-normal',
            'w-full',
            'hover:border-zinc-400',
            'focus:border-sky-500',
          )}
          ref={ref}
        >
          <div
            className={cx(
              'transition-colors',
              'truncate',
              selectedChoice?.label ? 'text-neutral-900' : 'text-neutral-400',
            )}
          >
            <_Select.Value asChild>
              <div>{selectedChoice?.label || props.placeholder}</div>
            </_Select.Value>
          </div>
          <_Select.Icon>
            <ChevronDown
              className={cx(
                'fill-neutral-900',
                'h-6',
                'transition-colors',
                'w-6',
              )}
            />
          </_Select.Icon>
        </_Select.Trigger>
      </div>
      <_Select.Portal>
        <_Select.Content
          className={cx(
            'bg-zinc-50',
            'border-zinc-300',
            'border',
            'rounded-md',
            'overflow-hidden',
            'tracking-normal',
            props.dropdownClassName,
          )}
        >
          <_Select.Viewport>
            {props.choices.map((choice) => (
              <_Select.Item
                value={choice.key}
                className={cx(
                  'cursor-pointer',
                  'flex',
                  'gap-x-2',
                  'h-14',
                  'items-center',
                  'justify-between',
                  'outline-none',
                  'pl-3',
                  'pr-8',
                  'relative',
                  'text-neutral-900',
                  'hover:bg-neutral-200',
                  'focus:bg-neutral-200',
                )}
                key={choice.key}
              >
                <div className="truncate">
                  <_Select.ItemText>{choice.label}</_Select.ItemText>
                </div>
                <_Select.ItemIndicator>
                  <Checkmark className="h-6 w-6 fill-current absolute top-1/2 right-3 -translate-y-1/2" />
                </_Select.ItemIndicator>
              </_Select.Item>
            ))}
          </_Select.Viewport>
        </_Select.Content>
      </_Select.Portal>
    </_Select.Root>
  );
});
