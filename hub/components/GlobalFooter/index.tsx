import * as Separator from '@radix-ui/react-separator';
import Link from 'next/link';

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
        For more about Realms, visit our{' '}
        <Link passHref href="/realm/rch">
          <a className="text-sky-500 hover:text-sky-400 transition-colors">
            Hub
          </a>
        </Link>
        . For feedback, you may post your issue on our feed to open a dialog.
      </div>
      <div className="max-w-md mt-6 mb-2.5 w-full">
        <Separator.Root className="h-[1px] w-full bg-black" />
      </div>
      <div
        className={cx(
          'flex-col',
          'flex',
          'items-center',
          'justify-center',
          'text-neutral-900',
          'text-xs',
          'sm:flex-row',
          'sm:text-sm',
        )}
      >
        <div>© 2022 Solana Technology Services LLC</div>
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
      <div className="text-sm mt-2 text-neutral-900">
        Powered by <span className="font-bold">Solana</span>
      </div>
    </footer>
  );
}
