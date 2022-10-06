import * as Tabs from '@radix-ui/react-tabs';
import React, { forwardRef } from 'react';

import cx from '@hub/lib/cx';

interface Props extends Tabs.TabsTriggerProps {
  className?: string;
  children: string;
  icon: JSX.Element;
  value: string;
}

const Inner = forwardRef<HTMLButtonElement, Props>(
  (props: Props & { 'data-state'?: 'active' | 'inactive' }, ref) => {
    const { className, children, icon, ...rest } = props;

    return (
      <button
        {...rest}
        className={cx(
          'flex',
          'h-14',
          'items-center',
          'justify-center',
          'space-x-1',
          className,
          rest['data-state'] === 'active' ? 'bg-white' : 'bg-neutral-200',
          rest['data-state'] === 'active'
            ? 'text-neutral-900'
            : 'text-neutral-500',
        )}
        ref={ref}
      >
        {React.cloneElement(icon, {
          className: cx(
            'h-4',
            'transition-all',
            'w-4',
            rest['data-state'] === 'active' ? 'grayscale-0' : 'grayscale',
            icon.props.className,
          ),
        })}
        <div className="mr-1 text-xs font-semibold uppercase">{children}</div>
      </button>
    );
  },
);

export function Tab(props: Props) {
  return (
    <Tabs.Trigger value={props.value} asChild>
      <Inner {...props} />
    </Tabs.Trigger>
  );
}
