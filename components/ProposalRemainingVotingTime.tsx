import { Governance, ProgramAccount, Proposal } from '@solana/spl-governance'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { useEffect, useState, useRef } from 'react'

import { ntext } from '@utils/ntext'

export const diffTime = (
  ended: boolean,
  now: dayjs.Dayjs,
  end: dayjs.Dayjs
) => {
  if (ended) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  const days = end.diff(now, 'day')
  const withoutDays = end.subtract(days, 'day')
  const hours = withoutDays.diff(now, 'hour')
  const withoutHours = withoutDays.subtract(hours, 'hour')
  const minutes = withoutHours.diff(now, 'minute')
  const withoutMinutes = withoutHours.subtract(minutes, 'minute')
  const seconds = withoutMinutes.diff(now, 'second')

  return { days, hours, minutes, seconds }
}

const Cell = ({
  count,
  hideLeadingZeros,
  label,
}: {
  count: number
  hideLeadingZeros?: boolean
  label: string
}) => (
  <div className="flex flex-col items-center w-10">
    <div className="text-3xl font-bold">
      {count < 10 &&
        (hideLeadingZeros ? <span className="opacity-30">0</span> : '0')}
      {hideLeadingZeros && count === 0 ? (
        <span className="opacity-30">0</span>
      ) : (
        count
      )}
    </div>
    <div className="text-xs text-fgd-3">{ntext(count, label)}</div>
  </div>
)

const Divider = () => (
  <div
    className={classNames(
      'flex-col',
      'flex',
      'font-bold',
      'items-center',
      'justify-start',
      'leading-[1.875rem]',
      'opacity-30',
      'text-[1.875rem]',
      'text-white',
      'w-5'
    )}
  >
    :
  </div>
)

interface Props {
  className?: string
  align?: 'left' | 'right'
  governance: ProgramAccount<Governance>
  proposal: ProgramAccount<Proposal>
}

export default function ProposalRemainingVotingTime(props: Props) {
  const voteTime = props.proposal.account.getTimeToVoteEnd(
    props.governance.account
  )
  const votingEnded = props.proposal.account.hasVoteTimeEnded(
    props.governance.account
  )

  const [now, setNow] = useState(dayjs())
  const end = useRef(dayjs(1000 * (dayjs().unix() + voteTime)))

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const { days, hours, minutes, seconds } = diffTime(
    votingEnded,
    now,
    end.current
  )

  return (
    <div className={props.className}>
      <h3 className={classNames(props.align === 'right' && 'text-right')}>
        Voting Time Remaining
      </h3>
      {votingEnded ? (
        <div
          className={classNames(
            'text-3xl',
            'font-bold',
            'text-fgd-3',
            props.align === 'right' && 'text-right'
          )}
        >
          Voting has ended
        </div>
      ) : (
        <div
          className={classNames(
            'flex',
            props.align === 'right' && 'justify-end'
          )}
        >
          <Cell hideLeadingZeros count={days} label="day" />
          <Divider />
          <Cell hideLeadingZeros={!days} count={hours} label="hour" />
          <Divider />
          <Cell
            hideLeadingZeros={!days && !hours}
            count={minutes}
            label="min"
          />
          <Divider />
          <Cell
            hideLeadingZeros={!days && !hours && !minutes}
            count={seconds}
            label="sec"
          />
        </div>
      )}
    </div>
  )
}
