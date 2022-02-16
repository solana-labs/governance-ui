import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/outline'

type VoteResultStatusProps = {
  votePassed: boolean | undefined
}

const VoteResultStatus = ({ votePassed }: VoteResultStatusProps) => {
  return (
    <div
      className={`border ${
        votePassed ? 'border-green' : 'border-red'
      } flex items-center p-3 rounded-md`}
    >
      {votePassed ? (
        <CheckCircleIcon className="h-6 mr-1.5 text-green w-6" />
      ) : (
        <XCircleIcon className="h-6 mr-1.5 text-red w-6" />
      )}
      <div>
        <h4 className="mb-0">
          {votePassed ? 'The proposal has passed' : 'The proposal has failed'}
        </h4>
      </div>
    </div>
  )
}

export default VoteResultStatus
