import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  text: React.ReactNode;
}

export function ValueDescription(props: Props) {
  return (
    <div className={cx(props.className, 'text-sm', 'dark:text-neutral-300')}>
      {props.text}
    </div>
  );
}
