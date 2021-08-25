import { ChevronRightIcon } from '@heroicons/react/solid'
import { ClockIcon } from '@heroicons/react/outline'
import StatusBadge from './StatusBadge'
import moment from 'moment'
import { Proposal, ProposalState } from '../models/accounts'
import BN from 'bn.js'
import Link from 'next/link'
import { MintInfo } from '@solana/spl-token'

export const ProposalStateLabels = {
  0: 'Draft',
  1: 'Draft',
  2: 'Active',
  3: 'Approved',
  4: 'Approved',
  5: 'Approved',
  6: 'Cancelled',
  7: 'Denied',
  8: 'Error',
}

type ProposalCardProps = {
  id: string
  proposal: Proposal
  mint: MintInfo
}

const votePrecision = 10000
const calculatePct = (c: BN, total: BN) =>
  c.mul(new BN(votePrecision)).div(total).toNumber() * (100 / votePrecision)

const fmtUnixTime = (d: BN) => moment.unix(d.toNumber()).fromNow()

const ProposalCard = ({ id, proposal, mint }: ProposalCardProps) => {
  const yesVotePct = calculatePct(proposal.yesVotesCount, mint.supply)
  const noVotePct = calculatePct(proposal.noVotesCount, mint.supply)

  return (
    <div>
      <Link href={`/proposal/${id}`}>
        <a>
          <div className="bg-bkg-2 p-6 rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="text-fgd-1">{proposal.name}</h3>
              <div className="flex items-center">
                <StatusBadge status={ProposalStateLabels[proposal.state]} />
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
            {proposal.descriptionLink ? (
              <p className="mt-3">{proposal.descriptionLink}</p>
            ) : null}

            <div className="flex space-x-4 mt-6">
              <div className="w-1/4">Yes: {yesVotePct}%</div>
              <div className="w-1/4">No: {noVotePct}%</div>
            </div>
          </div>
        </a>
      </Link>
    </div>
  )
}

export default ProposalCard
