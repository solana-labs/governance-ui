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
          'border-sky-500',
          'border',
          'flex',
          'group',
          'h-10',
          'items-center',
          'justify-center',
          'p-3',
          'relative',
          'rounded',
          'text-sky-500',
          'tracking-normal',
          'transition-colors',
          'dark:border-sky-400',
          'dark:text-sky-400',
          rest.className,
          'disabled:border-zinc-300',
          'disabled:cursor-not-allowed',
          !pending && 'hover:bg-sky-100',
          !pending && 'active:bg-sky-200',
          !pending && 'hover:bg-sky-400/10',
          !pending && 'active:bg-sky-400/20',
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
            'group-disabled:text-zinc-300',
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
