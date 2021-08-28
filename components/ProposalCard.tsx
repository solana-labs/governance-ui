import { ClockIcon } from '@heroicons/react/outline'
import { ChevronRightIcon } from '@heroicons/react/solid'
import StatusBadge from './StatusBadge'
import Link from 'next/link'
import { Proposal, ProposalState } from '../models/accounts'
import { fmtUnixTime } from '../utils/formatting'
import ApprovalProgress from './ApprovalProgress'
import useRealm from '../hooks/useRealm'
import useProposalVotes from '../hooks/useProposalVotes'

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

  return (
    <div>
      <Link href={`/dao/${symbol}/proposal/${id}`}>
        <a>
          <div className="bg-bkg-2 rounded-md">
            <div className="mb-2 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-fgd-1">{proposal.name}</h3>
                <div className="flex items-center">
                  <StatusBadge status={ProposalState[proposal.state]} />
                  <ChevronRightIcon className="h-6 ml-2 text-primary-light w-6" />
                </div>
              </div>
              <div className="flex items-center text-fgd-3 text-sm">
                <span className="flex items-center">
                  <ClockIcon className="h-4 mr-1.5 w-4" />
                  {proposal.votingCompletedAt
                    ? `${ProposalState[proposal.state]} ${fmtUnixTime(
                        proposal.votingCompletedAt
                      )}`
                    : proposal.votingAt
                    ? `Proposed ${fmtUnixTime(proposal.votingAt)}`
                    : `Drafted ${fmtUnixTime(proposal.draftAt)}`}
                </span>
              </div>
            </div>
            {!proposal.isPreVotingState() && (
              <div className="flex">
                <div className="bg-[rgba(255,255,255,0.05)] border-r border-bkg-4 px-6 py-4 w-1/2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <p className="font-bold ml-1 text-fgd-1">
                        <span className="mr-1 text-xs text-fgd-3">Approve</span>
                        {relativeYesVotes ? relativeYesVotes : 0}%
                      </p>
                    </div>
                    <div className="flex items-center">
                      <p className="font-bold ml-1 text-fgd-1">
                        <span className="mr-1 text-xs text-fgd-3">Deny</span>
                        {relativeNoVotes ? relativeNoVotes : 0}%
                      </p>
                    </div>
                  </div>
                  <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full">
                    <div
                      style={{
                        width: `${relativeYesVotes}%`,
                      }}
                      className={`bg-green flex rounded-l ${
                        relativeYesVotes === 100 && 'rounded'
                      }`}
                    ></div>
                    <div
                      style={{
                        width: `${relativeNoVotes}%`,
                      }}
                      className={`bg-red flex rounded-r ${
                        relativeNoVotes === 100 && 'rounded'
                      }`}
                    ></div>
                  </div>
                </div>
                <div className="w-1/2">
                  <ApprovalProgress progress={yesVoteProgress} />
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
