import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';

import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  content: React.ReactNode;
  imgSrc: string;
  publicKey: PublicKey;
  urlId: string;
}

export function LargeCard(props: Props) {
  return (
    <Link passHref href={`/realm/${props.urlId}`}>
      <a
        className={cx(
          'block',
          'overflow-hidden',
          'rounded',
          'h-[528px]',
          'w-[496px]',
          props.className,
        )}
      ></a>
    </Link>
  );
}
