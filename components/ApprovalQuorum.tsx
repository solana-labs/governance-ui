import Tooltip from './Tooltip'
import {
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'

type ApprovalProgressProps = {
  progress?: number
  yesVotesRequired?: number
  showBg?: boolean
}

// TODO make component display well when data is loading
const ApprovalProgress = ({
  progress,
  showBg,
  yesVotesRequired,
}: ApprovalProgressProps) => {
  return (
    <div className={`${showBg ? 'bg-bkg-1 p-3' : ''} rounded-md`}>
      <div className="flex items-center">
        <div className="w-full">
          <div className="flex items-center">
            <p className="text-fgd-2 mb-0 mr-1.5">Approval Quorum</p>
            <Tooltip content="Proposals must reach a minimum number of 'Yes' votes before they are eligible to pass. If the minimum is reached but there are more 'No' votes when voting ends the proposal will fail.">
              <InformationCircleIcon className="cursor-help h-5 text-fgd-2 w-5" />
            </Tooltip>
          </div>

          {(progress ?? 0) < 100 ? (
            <p className="font-bold mb-0 text-fgd-1">{`${(
              yesVotesRequired ?? 0
            ).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })} ${(progress ?? 0) > 0 ? 'more' : ''} Yes vote${
              (yesVotesRequired ?? 0) > 1 ? 's' : ''
            } required`}</p>
          ) : (
            <div className="flex items-center">
              <CheckCircleIcon className="flex-shrink-0 h-5 mr-1.5 text-green w-5" />
              <p className="font-bold mb-0 text-fgd-1">
                Required approval achieved
              </p>
            </div>
          )}
        </div>
      </div>
      {/* {progress < 100 ? ( */}
      <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full">
        <div
          style={{
            width: `${progress}%`,
          }}
          className={`${
            (progress ?? 0) >= 100 ? 'bg-green' : 'bg-fgd-3'
          } flex rounded`}
        ></div>
      </div>
      {/* ) : null} */}
    </div>
  )
}

export default ApprovalProgress
