const StatusBadge = ({ status }) => {
  return (
    <div className="bg-bkg-3 inline-block px-2 py-1 rounded-full text-fgd-1 text-xs">
      {status}
    </div>
  )
}

export default StatusBadge
