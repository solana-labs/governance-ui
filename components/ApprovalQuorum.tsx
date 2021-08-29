type ApprovalProgressProps = {
  progress: number
}

const ApprovalProgress = ({ progress }: ApprovalProgressProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="font-bold text-fgd-3 text-xs">Approval quorum</p>
        <div className="flex items-center">
          <p className="font-bold ml-1 text-fgd-1">{progress}%</p>
        </div>
      </div>
      <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full">
        <div
          style={{
            width: `${progress}%`,
          }}
          className="bg-fgd-3 flex rounded"
        ></div>
      </div>
    </>
  )
}

export default ApprovalProgress
