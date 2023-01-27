import cx from '@hub/lib/cx';

interface Props {
  className?: string;
}

export function GlobalFooter(props: Props) {
  return (
    <footer
      className={cx(
        props.className,
        'flex',
        'flex-col',
        'items-center',
        'px-4',
      )}
    >
      <div className="text-sm text-neutral-900 text-center">
        Powered by Solana and Realms.
      </div>
    </footer>
  );
}
