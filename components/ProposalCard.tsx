import { ClockIcon } from '@heroicons/react/outline'
import { ChevronRightIcon } from '@heroicons/react/solid'

import StatusBadge from './StatusBadge'
import Link from 'next/link'
import { MintInfo } from '@solana/spl-token'
import { Proposal, ProposalState } from '../models/accounts'
import { calculatePct, fmtUnixTime } from '../utils/formatting'
import ApprovalProgress from './ApprovalProgress'
import useRealm from '../hooks/useRealm'

type ProposalCardProps = {
  id: string
  proposal: Proposal
  mint: MintInfo
}

const ProposalCard = ({ id, proposal, mint }: ProposalCardProps) => {
  const { symbol } = useRealm()

  const yesVotePct = calculatePct(proposal.yesVotesCount, mint.supply)

  const yesVoteProgress =
    (yesVotePct / proposal.voteThresholdPercentage?.value) * 100

  return (
    <div>
      <Link href={`/dao/${symbol}/proposal/${id}`}>
        <a>
          <div className="bg-bkg-2 rounded-md">
            <div className="px-6 py-4">
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
              <ApprovalProgress progress={yesVoteProgress} />
            )}
          </div>
        </a>
      </Link>
    </div>
  )
}

export default ProposalCard
