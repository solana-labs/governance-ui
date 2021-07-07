import usePool from '../hooks/usePool'
import Countdown from 'react-countdown'
import moment from 'moment'

const PoolCountdown = (props: { date: moment.Moment }) => {
  const { endIdo, endDeposits } = usePool()
  const renderCountdown = ({ hours, minutes, seconds, completed }) => {
    const message =
      endDeposits?.isBefore() && endIdo?.isAfter()
        ? 'Deposits are closed'
        : 'The IDO has ended'
    if (completed) {
      return <p className="text-secondary-2-light">{message}</p>
    } else {
      return (
        <div className="font-bold pt-2 text-fgd-1 text-base">
          <span className="bg-bkg-1 border border-bkg-4 mx-0.5 px-1.5 py-1 rounded">
            {hours < 10 ? `0${hours}` : hours}
          </span>
          :
          <span className="bg-bkg-1 border border-bkg-4 mx-0.5 px-1.5 py-1 rounded">
            {minutes < 10 ? `0${minutes}` : minutes}
          </span>
          :
          <span className="bg-bkg-1 border border-bkg-4 mx-0.5 px-1.5 py-1 rounded">
            {seconds < 10 ? `0${seconds}` : seconds}
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
