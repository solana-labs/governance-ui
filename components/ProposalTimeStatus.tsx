import { ClockIcon } from '@heroicons/react/outline'
import useRealm from '../hooks/useRealm'
import { Proposal, ProposalState } from '../models/accounts'
import { fmtUnixTime } from '../utils/formatting'
import { VoteCountdown } from './VoteCountdown'

type ProposalTimeStatusProps = {
  proposal: Proposal
}

const ProposalTimeStatus = ({ proposal }: ProposalTimeStatusProps) => {
  const { governances } = useRealm()
  const governance = governances[proposal?.governance.toBase58()]?.info

  return proposal && governance ? (
    <div className="flex items-center text-fgd-3 text-sm">
      <span className="flex items-center">
        <ClockIcon className="h-4 mr-1 w-4" />
        {proposal.votingCompletedAt ? (
          `${ProposalState[proposal.state]} ${fmtUnixTime(
            proposal.votingCompletedAt
          )}`
        ) : proposal.votingAt ? (
          <VoteCountdown proposal={proposal} governance={governance} />
        ) : (
          `Drafted ${fmtUnixTime(proposal.draftAt)}`
        )}
      </span>
    </div>
  ) : null
}

export default ProposalTimeStatus
