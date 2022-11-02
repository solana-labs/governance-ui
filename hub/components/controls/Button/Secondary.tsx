import { forwardRef } from 'react';

import { LoadingDots } from '@hub/components/LoadingDots';
import cx from '@hub/lib/cx';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
}

export const Secondary = forwardRef<HTMLButtonElement, Props>(
  function Secondary(props, ref) {
    const { pending, ...rest } = props;

    return (
      <button
        {...rest}
        ref={ref}
        className={cx(
          'border-neutral-500',
          'border',
          'flex',
          'group',
          'h-10',
          'items-center',
          'justify-center',
          'p-3',
          'relative',
          'rounded',
          'text-neutral-500',
          'tracking-normal',
          'transition-colors',
          rest.className,
          !pending && 'active:border-neutral-900',
          'disabled:border-neutral-300',
          'disabled:cursor-not-allowed',
          !pending && 'hover:border-neutral-700',
          pending && 'cursor-not-allowed',
        )}
        onClick={(e) => {
          if (!pending && !rest.disabled) {
            rest.onClick?.(e);
          }
        }}
      >
        <div
          className={cx(
            'flex',
            'items-center',
            'justify-center',
            'text-current',
            'text-sm',
            'transition-all',
            !pending && 'group-active:text-neutral-900',
            'group-disabled:text-neutral-300',
            !pending && 'group-hover:text-neutral-700',
            pending ? 'opacity-0' : 'opacity-100',
          )}
        >
          {rest.children}
        </div>
        {pending && (
          <LoadingDots className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </button>
    );
  },
);
