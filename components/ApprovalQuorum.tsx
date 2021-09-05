import Tooltip from './Tooltip'

type ApprovalProgressProps = {
  progress: number
}

const ApprovalProgress = ({ progress }: ApprovalProgressProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Tooltip content="The minimum number of approve votes required. Once approval quorum is >= 100% the proposal is eligible to pass.">
          <p className="border-b border-dashed border-fgd-3 font-bold text-fgd-3 text-xs hover:cursor-help hover:border-b-0">
            Approval quorum
          </p>
        </Tooltip>
        <div className="flex items-center">
          <p className="font-bold ml-1 text-fgd-1">{progress.toFixed(2)}%</p>
        </div>
      </div>
      <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full">
        <div
          style={{
            width: `${progress}%`,
          }}
          className={`${progress >= 100 ? 'bg-green' : 'bg-red'} flex rounded`}
        ></div>
      </div>
    </>
  )
}

export default ApprovalProgress
