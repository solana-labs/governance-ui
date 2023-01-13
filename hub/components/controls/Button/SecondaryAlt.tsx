import { forwardRef } from 'react';

import { LoadingDots } from '@hub/components/LoadingDots';
import cx from '@hub/lib/cx';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
}

export const SecondaryAlt = forwardRef<HTMLButtonElement, Props>(
  function SecondaryAlt(props, ref) {
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
          'dark:border-neutral-50',
          'dark:text-neutral-50',
          rest.className,
          'disabled:border-zinc-300',
          'disabled:cursor-not-allowed',
          !pending && 'hover:bg-sky-100',
          !pending && 'active:bg-sky-200',
          pending && 'cursor-not-allowed',
          !pending && 'dark:hover:bg-neutral-50/20',
          !pending && 'disabled:dark:hover:bg-transparent',
          !pending && 'dark:active:border-neutral-300',
          !pending && 'dark:active:text-neutral-300',
          !pending && 'dark:hover:border-neutral-200',
          !pending && 'dark:hover:text-neutral-200',
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
