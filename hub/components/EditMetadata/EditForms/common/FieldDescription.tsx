import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function FieldDescription(props: Props) {
  return (
    <p
      className={cx(
        'm-0',
        'max-w-2xl',
        'text-sm',
        'text-neutral-700',
        props.className,
      )}
    >
      {props.children}
    </p>
  );
}
