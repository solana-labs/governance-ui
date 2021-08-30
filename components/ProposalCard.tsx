import { ChevronRightIcon } from '@heroicons/react/solid'
import StatusBadge from './StatusBadge'
import Link from 'next/link'
import { Proposal, ProposalState } from '../models/accounts'
import { fmtUnixTime } from '../utils/formatting'
import ApprovalQuorum from './ApprovalQuorum'
import useRealm from '../hooks/useRealm'
import useProposalVotes from '../hooks/useProposalVotes'
import VoteResultsBar from './VoteResultsBar'
import ProposalTimeStatus from './ProposalTimeStatus'

type ProposalCardProps = {
  id: string
  proposal: Proposal
}

const ProposalCard = ({ id, proposal }: ProposalCardProps) => {
  const { symbol } = useRealm()
  const {
    yesVoteProgress,
    relativeNoVotes,
    relativeYesVotes,
  } = useProposalVotes(proposal)

  console.log(
    proposal &&
      proposal.votingCompletedAt &&
      fmtUnixTime(proposal.votingCompletedAt)
  )

  return (
    <div>
      <Link href={`/dao/${symbol}/proposal/${id}`}>
        <a>
          <div className="bg-bkg-2 rounded-lg">
            <div className="mb-2 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-fgd-1">{proposal.name}</h3>
                <div className="flex items-center">
                  <StatusBadge status={ProposalState[proposal.state]} />
                  <ChevronRightIcon className="h-6 ml-2 text-primary-light w-6" />
                </div>
              </div>
              <ProposalTimeStatus proposal={proposal} />
            </div>
            {ProposalState[proposal.state] === 'Voting' && (
              <div className="bg-[rgba(255,255,255,0.05)] flex px-6 py-4">
                <div className="border-r border-bkg-4 pr-4 w-1/2">
                  <VoteResultsBar
                    approveVotePercentage={
                      relativeYesVotes ? relativeYesVotes : 0
                    }
                    denyVotePercentage={relativeNoVotes ? relativeNoVotes : 0}
                  />
                </div>
                <div className="pl-4 w-1/2">
                  <ApprovalQuorum progress={yesVoteProgress} />
                </div>
              </div>
            )}
          </div>
        </a>
      </Link>
    </div>
  )
}

export default ProposalCard
