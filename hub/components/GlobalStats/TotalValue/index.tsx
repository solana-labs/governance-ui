import * as common from '../common';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

interface Props {
  className?: string;
  value: number;
}

export function TotalValue(props: Props) {
  return (
    <section
      className={cx(
        'h-0',
        'mt-0',
        'opacity-0',
        'overflow-hidden',
        'transition-all',
        !!props.value && 'h-auto',
        !!props.value && 'mt-16',
        !!props.value && 'opacity-100',
        props.className,
      )}
    >
      <common.Label>Total Value Locked</common.Label>
      <common.Value>
        {'$' +
          formatNumber(props.value, undefined, {
            maximumFractionDigits: 0,
          })}
      </common.Value>
    </section>
  );
}
