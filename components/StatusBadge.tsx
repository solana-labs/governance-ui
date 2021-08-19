const StatusBadge = ({ status }) => {
  return (
    <div className="bg-bkg-3 flex items-center px-2 py-1 rounded-full">
      <span className="text-fgd-1 text-xs">{status}</span>
    </div>
  )
}

export default StatusBadge
