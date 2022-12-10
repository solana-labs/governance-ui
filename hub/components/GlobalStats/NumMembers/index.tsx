import * as common from '../common';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

interface Props {
  className?: string;
  members: Set<string>;
}

export function NumMembers(props: Props) {
  const count = props.members.size;

  return (
    <section
      className={cx(
        'h-0',
        'mt-0',
        'opacity-0',
        'overflow-hidden',
        'transition-all',
        !!count && 'h-auto',
        !!count && 'mt-16',
        !!count && 'opacity-100',
        props.className,
      )}
    >
      <common.Label>Number of Members</common.Label>
      <common.Value>
        {formatNumber(count, undefined, {
          maximumFractionDigits: 0,
        })}
      </common.Value>
    </section>
  );
}
