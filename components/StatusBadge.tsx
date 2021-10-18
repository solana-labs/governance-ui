const StatusBadge = ({ status }) => {
  const renderStatusColor = (status) => {
    if (
      status === 'Voting' ||
      status === 'Executing' ||
      status === 'SigningOff'
    ) {
      return 'border border-blue text-blue'
    } else if (status === 'Completed' || status === 'Succeeded') {
      return 'border border-green text-green'
    } else if (
      status === 'Cancelled' ||
      status === 'Defeated' ||
      status === 'ExecutingWithErrors'
    ) {
      return 'border border-red text-red'
    } else {
      return 'border border-fgd-3 text-fgd-3'
    }
  }

  return (
    <div
      className={`${renderStatusColor(
        status
      )} inline-block px-2 py-1 rounded-full text-xs`}
    >
      {status}
    </div>
  )
}

export default StatusBadge
