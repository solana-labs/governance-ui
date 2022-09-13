import cx from '@hub/lib/cx';

interface Props {
  className?: string;
}

export function Loading(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'animate-pulse',
        'bg-white/10',
        'cursor-pointer',
        'flex',
        'items-center',
        'justify-center',
        'py-1',
        'rounded',
        'transition-colors',
        'w-48',
      )}
    >
      &nbsp;
    </div>
  );
}
