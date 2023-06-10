import { forwardRef } from 'react';

import { LoadingDots } from '@hub/components/LoadingDots';
import cx from '@hub/lib/cx';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
}

export const Tertiary = forwardRef<HTMLButtonElement, Props>(function Tertiary(
  props,
  ref,
) {
  const { pending, ...rest } = props;

  return (
    <button
      {...rest}
      ref={ref}
      className={cx(
        'border-neutral-400',
        'border',
        'flex',
        'group',
        'h-10',
        'items-center',
        'justify-center',
        'p-3',
        'relative',
        'rounded',
        'text-neutral-400',
        'tracking-normal',
        'transition-colors',
        rest.className,
        'disabled:border-zinc-300',
        'disabled:cursor-not-allowed',
        !pending && 'hover:bg-neutral-100',
        !pending && 'active:bg-neutral-200',
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
});
