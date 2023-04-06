import type { PublicKey } from '@solana/web3.js';

import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  compressed?: boolean;
  userPublicKey: PublicKey;
}

export function Connected(props: Props) {
  const username = abbreviateAddress(props.userPublicKey);

  return (
    <div
      className={cx(
        'flex',
        'gap-x-1',
        'items-center',
        'justify-between',
        'py-2',
        'px-3',
        'rounded',
        'text-neutral-900',
        'dark:text-neutral-400',
        props.className,
        !props.compressed && 'w-48',
      )}
    >
      <div className="flex items-center space-x-2 flex-shrink truncate">
        <AuthorAvatar author={null} className="h-6 w-6 text-xs" />
        {!props.compressed && (
          <div className="truncate flex-shrink">{username}</div>
        )}
      </div>
      <div />
    </div>
  );
}
