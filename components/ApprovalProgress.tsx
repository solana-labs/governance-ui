import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid'

type ApprovalProgressProps = {
  progress: number
}

const ApprovalProgress = ({ progress }: ApprovalProgressProps) => {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] px-6 py-4 rounded-b-md">
      <div className="flex items-center justify-between">
        <p className="text-fgd-1">Approval Progress</p>
        <div className="flex items-center">
          {progress >= 100 ? (
            <CheckCircleIcon className="h-5 text-green w-5" />
          ) : (
            <XCircleIcon className="h-5 text-red w-5" />
          )}
          <p className="font-bold ml-1 text-fgd-1">{progress}%</p>
        </div>
      </div>
      <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full">
        <div
          style={{
            width: `${progress}%`,
          }}
          className="bg-primary-light flex rounded"
        ></div>
      </div>
    </div>
  )
}

export default ApprovalProgress
