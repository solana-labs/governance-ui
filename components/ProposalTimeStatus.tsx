import { ClockIcon } from '@heroicons/react/outline'
import { Proposal, ProposalState } from '../models/accounts'
import { fmtUnixTime } from '../utils/formatting'
import { VoteCountdown } from './VoteCountdown'

type ProposalTimeStatusProps = {
  proposal: Proposal
}

const ProposalTimeStatus = ({ proposal }: ProposalTimeStatusProps) => {
  return proposal ? (
    <div className="flex items-center text-fgd-3 text-sm">
      <span className="flex items-center">
        <ClockIcon className="h-4 mr-1.5 w-4" />
        {proposal.votingCompletedAt ? (
          `${ProposalState[proposal.state]} ${fmtUnixTime(
            proposal.votingCompletedAt
          )}`
        ) : proposal.votingAt ? (
          <VoteCountdown proposal={proposal} governance={null} />
        ) : (
          `Drafted ${fmtUnixTime(proposal.draftAt)}`
        )}
      </span>
    </div>
  ) : null
}

export default ProposalTimeStatus
