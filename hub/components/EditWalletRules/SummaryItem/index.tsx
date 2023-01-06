import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  label: React.ReactNode;
  value: React.ReactNode;
}

export function SummaryItem(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'border-l',
        'pl-4',
        'dark:border-neutral-700',
      )}
    >
      <div className="text-sm dark:text-neutral-500">{props.label}</div>
      <div className="mt-2 text-xl dark:text-white">{props.value}</div>
    </div>
  );
}
