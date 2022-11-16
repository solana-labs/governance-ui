import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  children: string;
}

export function FieldHeader(props: Props) {
  return (
    <h1
      className={cx(
        'font-bold',
        'm-0',
        'text-base',
        'text-neutral-700',
        props.className,
      )}
    >
      {props.children}
    </h1>
  );
}
