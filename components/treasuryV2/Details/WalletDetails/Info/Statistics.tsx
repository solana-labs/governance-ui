import React from 'react'

import { Wallet } from '@models/treasury/Wallet'
import { formatNumber } from '@utils/formatNumber'

interface Props {
  className?: string
  statistics: Wallet['stats']
}

export default function Statistics(props: Props) {
  return (
    <section className={props.className}>
      <div className="grid grid-cols-[max-content_max-content] gap-x-8 gap-y-4">
        {[
          {
            title: 'Proposals Count',
            value: props.statistics.proposalsCount || 0,
          },
          {
            title: 'Voting Proposals Count',
            value: props.statistics.votingProposalCount || 0,
          },
        ].map(({ title, value }) => (
          <React.Fragment key={title}>
            <div className="text-white/50 text-sm">{title}</div>
            <div className="font-bold text-fgd-1 text-sm">
              {formatNumber(value, undefined, { minimumFractionDigits: 0 })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}
