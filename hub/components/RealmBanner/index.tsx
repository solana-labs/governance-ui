import type { PublicKey } from '@solana/web3.js';

import cx from '@hub/lib/cx';
import { getDefaultBannerUrl } from '@hub/lib/getDefaultBannerUrl';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  bannerUrl?: string | null;
  realm: PublicKey;
}

export function Content(props: Props) {
  const url = props.bannerUrl || getDefaultBannerUrl(props.realm);

  return (
    <div
      className={cx(
        'bg-center',
        'bg-cover',
        'h-60',
        'w-full',
        'bg-white',
        props.className,
      )}
      style={{ backgroundImage: `url(${url})` }}
    />
  );
}

export function Error(props: BaseProps) {
  return (
    <div
      className={cx(
        'bg-center',
        'bg-cover',
        'h-60',
        'w-full',
        'bg-neutral-200',
        props.className,
      )}
    />
  );
}

export function Loading(props: BaseProps) {
  return (
    <div
      className={cx(
        'animate-pulse',
        'bg-center',
        'bg-cover',
        'h-60',
        'w-full',
        'bg-neutral-200',
        props.className,
      )}
    />
  );
}
