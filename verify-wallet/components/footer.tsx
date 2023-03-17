import cx from '@hub/lib/cx';

interface Props {
  className?: string;
}

export function GlobalFooter(props: Props) {
  const year = new Date().getFullYear();
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
        Powered by Solana, Realms is a hub for communities to share ideas, make
        decisions, and collectively manage treasuries.
      </div>
      <div
        className={cx(
          'flex-col',
          'flex',
          'items-center',
          'justify-center',
          'text-neutral-700',
          'text-xs',
          'mt-2',
          'sm:flex-row',
          'sm:text-sm',
        )}
      >
        <div>© {year} Solana Technology Services LLC</div>
        <div className="hidden sm:block mx-2">|</div>
        <a href="https://realms.today/terms" target="_blank" rel="noreferrer">
          Terms
        </a>
        <div className="hidden sm:block mx-2">|</div>
        <a
          href="https://realms.today/privacy-policy"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
