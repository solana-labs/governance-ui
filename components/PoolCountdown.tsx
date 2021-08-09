import usePool from '../hooks/usePool'
import Countdown from 'react-countdown'
import moment from 'moment'
import { ClockIcon } from '@heroicons/react/outline'

const PoolCountdown = (props: { className?: string; date: moment.Moment }) => {
  const { endIdo, endDeposits } = usePool()
  const renderCountdown = ({ days, hours, minutes, seconds, completed }) => {
    hours += days * 24
    const message =
      endDeposits?.isBefore() && endIdo?.isAfter()
        ? 'Deposits are closed'
        : 'The IDO has ended'
    if (completed) {
      return <p className="text-mango-red text-xl">{message}</p>
    } else {
      return (
        <div
          className={`${props.className} font-bold text-white flex items-center`}
        >
          <ClockIcon className="w-5 h-5 mr-2 mt-0.5 text-fgd-3" />
          <span className="text-xl">
            {/* <span className="bg-bkg-1 border border-bkg-4 mx-0.5 px-1.5 py-1 rounded"> */}
            {hours < 10 ? `0${hours}` : hours}
            {/* </span> */}:
            {/* <span className="bg-bkg-1 border border-bkg-4 mx-0.5 px-1.5 py-1 rounded"> */}
            {minutes < 10 ? `0${minutes}` : minutes}
            {/* </span> */}:
            {/* <span className="bg-bkg-1 border border-bkg-4 mx-0.5 px-1.5 py-1 rounded"> */}
            {seconds < 10 ? `0${seconds}` : seconds}
            {/* </span> */}
          </span>
        </div>
      )
    }
  }

  if (props.date) {
    return <Countdown date={props.date.format()} renderer={renderCountdown} />
  } else {
    return null
  }
}

export default PoolCountdown
