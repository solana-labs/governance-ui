import classNames from 'classnames'
import type { BigNumber } from 'bignumber.js'

const getPct = (amount: BigNumber, total: BigNumber) => {
  if (amount.isZero()) {
    return '0'
  }

  const pct = amount.shiftedBy(2).dividedBy(total)

  if (pct.isLessThan(0.01)) {
    return '<0.01'
  }

  return pct.toFixed(2)
}

interface Props {
  className?: string
  amount: BigNumber
  total: BigNumber
}

export default function VotingPowerPct(props: Props) {
  return (
    <div
      className={classNames(
        props.className,
        'leading-[15px]',
        'text-xs',
        'text-right',
        'text-white/70'
      )}
    >
      {getPct(props.amount, props.total)}% of total
      <br />
      voting power
    </div>
  )
}
