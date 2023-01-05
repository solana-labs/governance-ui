import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  value: React.ReactNode;
  units: React.ReactNode;
}

export function SliderValue(props: Props) {
  return (
    <div
      className={cx(
        'grid',
        'grid-cols-[24px,1fr]',
        'gap-x-1',
        'items-center',
        'px-3',
        'bg-neutral-800',
        'border',
        'border-neutral-700',
        'h-14',
        'rounded-lg',
      )}
    >
      <div className="text-center dark:text-neutral-50">{props.value}</div>
      <div className="text-center dark:text-neutral-500">{props.units}</div>
    </div>
  );
}
