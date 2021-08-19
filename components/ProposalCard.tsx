import { ChevronRightIcon } from '@heroicons/react/solid'
import { ClockIcon } from '@heroicons/react/outline'
import StatusBadge from './StatusBadge'

const ProposalCard = ({ proposal }) => {
  return (
    <div className="bg-bkg-2 p-6 rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-fgd-1">{proposal.name}</h3>
        <div className="flex items-center">
          <StatusBadge status="Status" />
          <ChevronRightIcon className="h-6 ml-2 text-primary-light w-6" />
        </div>
      </div>
      <div className="flex items-center text-fgd-3 text-sm">
        <span className="flex items-center">
          <ClockIcon className="h-4 mr-1.5 w-4" />2 days 22 hours 7 mins
        </span>
      </div>
      {proposal.descriptionLink ? (
        <p className="mt-3">{proposal.descriptionLink}</p>
      ) : null}
    </div>
  )
}

export default ProposalCard
