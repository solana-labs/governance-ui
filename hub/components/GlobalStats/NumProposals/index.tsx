import { ProgramAccount, Proposal } from '@solana/spl-governance';

import * as common from '../common';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

interface Props {
  className?: string;
  proposals: ProgramAccount<Proposal>[];
}

export function NumProposals(props: Props) {
  return (
    <section
      className={cx(
        'h-0',
        'mt-0',
        'opacity-0',
        'overflow-hidden',
        'transition-all',
        !!props.proposals.length && 'h-auto',
        !!props.proposals.length && 'mt-16',
        !!props.proposals.length && 'opacity-100',
        props.className,
      )}
    >
      <common.Label>Number of Proposals</common.Label>
      <common.Value>
        {formatNumber(props.proposals.length, undefined, {
          maximumFractionDigits: 0,
        })}
      </common.Value>
    </section>
  );
}
