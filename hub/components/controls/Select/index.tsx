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

interface Props<T> {
  className?: string;
  dropdownClassName?: string;
  choices: Choice<T>[];
  selected: string;
  onChange?(item: Choice<T>): void;
}

interface Select {
  <T>(props: Props<T>, ref: HTMLButtonElement): ReturnType<
    ForwardRefRenderFunction<Props<T>, HTMLButtonElement>
  >;
}

export const Select: Select = forwardRef(function Select<T>(
  props: Props<T>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const selectedChoice = props.choices.find(
    (choice) => choice.key === props.selected,
  );

  if (!selectedChoice) {
    throw new Error('Invalid selected choice');
  }

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
      <_Select.Trigger
        className={cx(
          'flex',
          'group',
          'h-10',
          'items-center',
          'justify-end',
          'outline-none',
          'px-3',
          'space-x-2',
          'tracking-normal',
          props.className,
        )}
        ref={ref}
      >
        <div
          className={cx(
            'text-neutral-500',
            'text-sm',
            'transition-colors',
            'group-hover:text-neutral-900',
          )}
        >
          <_Select.Value>{selectedChoice.label}</_Select.Value>
        </div>
        <_Select.Icon>
          <ChevronDown
            className={cx(
              'fill-neutral-500',
              'h-3',
              'transition-colors',
              'w-3',
              'group-hover:fill-neutral-900',
            )}
          />
        </_Select.Icon>
      </_Select.Trigger>
      <_Select.Portal>
        <_Select.Content
          className={cx(
            'bg-white',
            'rounded',
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
                  'h-10',
                  'items-center',
                  'justify-end',
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
                <div className="text-sm">
                  <_Select.ItemText>{choice.label}</_Select.ItemText>
                </div>
                <_Select.ItemIndicator>
                  <Checkmark className="h-3 w-3 fill-current absolute top-1/2 right-3 -translate-y-1/2" />
                </_Select.ItemIndicator>
              </_Select.Item>
            ))}
          </_Select.Viewport>
        </_Select.Content>
      </_Select.Portal>
    </_Select.Root>
  );
});
