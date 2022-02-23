import Tooltip from './Tooltip'
import {
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'

type ApprovalProgressProps = {
  progress: number
  showBg?: boolean
  yesVotesRequired: number
}

const ApprovalProgress = ({
  progress,
  showBg,
  yesVotesRequired,
}: ApprovalProgressProps) => {
  return (
    <div
      className={`${
        progress < 100
          ? showBg
            ? 'bg-bkg-1 p-3'
            : ''
          : 'border border-fgd-4 flex h-full p-3'
      } rounded-md`}
    >
      <div className="flex items-center">
        {progress < 100 ? null : (
          <CheckCircleIcon className="flex-shrink-0 h-6 mr-1.5 text-green w-6" />
        )}
        <div className="w-full">
          <div className="flex items-center">
            <p className="text-fgd-2 mb-0 mr-1.5">
              {progress < 100 ? `Approval Quorum` : 'Approval quorum achieved'}
            </p>
            <Tooltip content="Proposals need to reach a minimum number of 'Yes' votes before they are eligible to pass. If the minimum is reached but there are more 'No' votes than 'Yes' votes the proposal will fail.">
              <InformationCircleIcon className="cursor-help h-5 text-fgd-2 w-5" />
            </Tooltip>
          </div>

          {progress < 100 ? (
            <div className="flex items-end justify-between w-full">
              <p className="font-bold mb-0 text-fgd-1">{`${yesVotesRequired?.toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 0,
                }
              )} more Yes vote${yesVotesRequired > 1 ? 's' : ''} required`}</p>
              <p className="font-bold mb-0 text-fgd-1">
                {progress.toFixed(1)}%
              </p>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
      {progress < 100 ? (
        <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full">
          <div
            style={{
              width: `${progress}%`,
            }}
            className={`${
              progress >= 100 ? 'bg-green' : 'bg-fgd-3'
            } flex rounded`}
          ></div>
        </div>
      ) : null}
    </div>
  )
}

export default ApprovalProgress
