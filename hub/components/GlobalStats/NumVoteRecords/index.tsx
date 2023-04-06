import { ProgramAccount, VoteRecord } from '@solana/spl-governance';

import * as common from '../common';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

interface Props {
  className?: string;
  voteRecords: ProgramAccount<VoteRecord>[];
}

export function NumVoteRecords(props: Props) {
  return (
    <section
      className={cx(
        'h-0',
        'mt-0',
        'opacity-0',
        'overflow-hidden',
        'transition-all',
        !!props.voteRecords.length && 'h-auto',
        !!props.voteRecords.length && 'mt-16',
        !!props.voteRecords.length && 'opacity-100',
        props.className,
      )}
    >
      <common.Label>Number of Votes</common.Label>
      <common.Value>
        {formatNumber(props.voteRecords.length, undefined, {
          maximumFractionDigits: 0,
        })}
      </common.Value>
    </section>
  );
}
