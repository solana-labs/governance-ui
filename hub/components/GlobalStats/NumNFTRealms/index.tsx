import { PublicKey } from '@solana/web3.js';

import * as common from '../common';
import { LoadingDots } from '@hub/components/LoadingDots';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

interface Props {
  className?: string;
  fetching?: boolean;
  realms: PublicKey[];
}

export function NumNFTRealms(props: Props) {
  return (
    <section
      className={cx(
        'h-0',
        'mt-0',
        'opacity-0',
        'overflow-hidden',
        'transition-all',
        !!props.realms.length && 'h-auto',
        !!props.realms.length && 'mt-16',
        !!props.realms.length && 'opacity-100',
        props.className,
      )}
    >
      <div className="flex items-baseline">
        <common.Label>Number of NFT Realms</common.Label>
        {props.fetching && (
          <LoadingDots
            className="text-xs ml-1 text-neutral-400"
            style="pulse"
          />
        )}
      </div>
      <common.Value>
        {formatNumber(props.realms.length, undefined, {
          maximumFractionDigits: 0,
        })}
      </common.Value>
    </section>
  );
}
