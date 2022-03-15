import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/outline'

type VoteResultStatusProps = {
  progress: number
  votePassed: boolean | undefined
  yesVotesRequired: number
}

const VoteResultStatus = ({
  progress,
  votePassed,
  yesVotesRequired,
}: VoteResultStatusProps) => {
  return votePassed ? (
		<div className="bg-bkg-1 flex items-center">
			<CheckCircleIcon className="h-5 mr-1.5 text-green w-5" />
			<h4 className="mb-0">The proposal has passed</h4>
		</div>
  ) : (
		<div className="bg-bkg-1 text-red">
			<div className="flex items-center">
				{/* <XCircleIcon className="h-5 mr-1.5 text-red w-5" /> */}
				<div>
					<h4 className="mb-0 text-red">The proposal has failed</h4>
					<p className="mb-0 text-red">{`${yesVotesRequired?.toLocaleString(undefined, {
						maximumFractionDigits: 0,
					})} more Yes vote${yesVotesRequired > 1 ? 's' : ''} were needed`}</p>
				</div>
			</div>
			<div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full  text-red">
				<div
					style={{
						width: `${progress}%`,
					}}
					className={`${progress >= 100 ? 'bg-red' : 'bg-fgd-3'} flex rounded`}
				></div>
			</div>
		</div>
  )
}

export default VoteResultStatus
