import React from 'react';

import * as common from '../common';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

interface Props {
  className?: string;
  valueByDao: {
    [dao: string]: number;
  };
}

export function ValueByDao(props: Props) {
  const shouldShow = Object.keys(props.valueByDao).length > 0;

  return (
    <section
      className={cx(
        'h-0',
        'mt-0',
        'opacity-0',
        'overflow-hidden',
        'transition-all',
        !!shouldShow && 'h-auto',
        !!shouldShow && 'mt-16',
        !!shouldShow && 'opacity-100',
        props.className,
      )}
    >
      <common.Label>Total Value Locked by DAO</common.Label>
      <div
        className={cx(
          'grid',
          'grid-cols-[max-content,1fr]',
          'gap-4',
          'mt-2',
          'max-h-96',
          'overflow-y-auto',
        )}
      >
        {Object.entries(props.valueByDao)
          .sort((a, b) => b[1] - a[1])
          .map(([dao, value]) => (
            <React.Fragment key={dao}>
              <div>{dao}</div>
              <div>
                $
                {formatNumber(value, undefined, {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}
              </div>
            </React.Fragment>
          ))}
      </div>
    </section>
  );
}
