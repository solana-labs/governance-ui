import React from 'react';

import * as common from '../common';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

interface Props {
  className?: string;
  valueByDao: {
    [dao: string]: number;
  };
  valueByDaoAndTokens: {
    [name: string]: {
      [token: string]: number;
    };
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
          'grid-cols-[repeat(5,max-content)]',
          'gap-y-4',
          'gap-x-8',
          'mt-2',
          'max-h-96',
          'overflow-y-auto',
        )}
      >
        {Object.entries(props.valueByDao)
          .sort((a, b) => b[1] - a[1])
          .map(([dao, value]) => {
            const daoTokens = props.valueByDaoAndTokens[dao] || {};
            const daoTokensSorted = Object.entries(daoTokens)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);

            return (
              <React.Fragment key={dao}>
                <div>{dao}</div>
                <div>
                  $
                  {formatNumber(value, undefined, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div>
                  {daoTokensSorted[0]
                    ? `${daoTokensSorted[0][0]} $${formatNumber(
                        daoTokensSorted[0][1],
                        undefined,
                        {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        },
                      )}`
                    : null}
                </div>
                <div>
                  {daoTokensSorted[1]
                    ? `${daoTokensSorted[1][0]} $${formatNumber(
                        daoTokensSorted[1][1],
                        undefined,
                        {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        },
                      )}`
                    : null}
                </div>
                <div>
                  {daoTokensSorted[2]
                    ? `${daoTokensSorted[2][0]} $${formatNumber(
                        daoTokensSorted[2][1],
                        undefined,
                        {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        },
                      )}`
                    : null}
                </div>
              </React.Fragment>
            );
          })}
      </div>
    </section>
  );
}
