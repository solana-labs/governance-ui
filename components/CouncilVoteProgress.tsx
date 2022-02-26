import Tooltip from './Tooltip'
import { InformationCircleIcon } from '@heroicons/react/outline'

type CouncilVoteProgressProps = {
  minimumYesVotes: number
  progress: number
  showBg?: boolean
  yesVotesRequired: number
}

const CouncilVoteProgress = ({
  minimumYesVotes,
  progress,
  showBg,
  yesVotesRequired,
}: CouncilVoteProgressProps) => {
  return (
    <div className={`${showBg ? 'bg-bkg-1 p-3' : ''} rounded-md`}>
      <div className="flex items-center">
        <div className="w-full">
          <div className="flex items-center">
            <p className="text-fgd-2 mb-0 mr-1.5">Vote Progress</p>
            <Tooltip
              content={`The proposal will pass when there are ${minimumYesVotes.toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 0,
                }
              )} Yes votes.`}
            >
              <InformationCircleIcon className="cursor-help h-5 text-fgd-2 w-5" />
            </Tooltip>
          </div>

          <p className="font-bold mb-0 text-fgd-1 ">
            {`${(minimumYesVotes - yesVotesRequired).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })} of ${minimumYesVotes.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}`}
          </p>
        </div>
      </div>
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
    </div>
  )
}

export default CouncilVoteProgress
