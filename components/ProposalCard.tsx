import { ChevronRightIcon } from '@heroicons/react/solid'
import { ClockIcon } from '@heroicons/react/outline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid'
import StatusBadge from './StatusBadge'
import moment from 'moment'
import { Proposal, ProposalState } from '../models/accounts'
import BN from 'bn.js'
import Link from 'next/link'
import { MintInfo } from '@solana/spl-token'
import { ProposalStateLabels } from '../pages/dao/[symbol]'

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
  // const noVotePct = calculatePct(proposal.noVotesCount, mint.supply)

  const yesVoteProgress =
    (yesVotePct / proposal.voteThresholdPercentage.value) * 100

  console.log(proposal.yesVotesCount.toString())

  return (
    <div>
      <Link href={`/proposal/${id}`}>
        <a>
          <div className="bg-bkg-2 rounded-md">
            <div className="px-6 py-4">
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
            </div>
            <div className="bg-[rgba(255,255,255,0.05)] px-6 py-4 rounded-b-md">
              <div className="flex items-center justify-between">
                <p className="text-fgd-1">Approval Progress</p>
                <div className="flex items-center">
                  {yesVoteProgress > 100 ? (
                    <CheckCircleIcon className="h-5 text-green w-5" />
                  ) : (
                    <XCircleIcon className="h-5 text-red w-5" />
                  )}
                  <p className="font-bold ml-1 text-fgd-1">
                    {yesVoteProgress}%
                  </p>
                </div>
              </div>
              <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full">
                <div
                  style={{
                    width: `${yesVoteProgress}%`,
                  }}
                  className="bg-primary-light flex rounded"
                ></div>
              </div>
            </div>
          </div>
        </a>
      </Link>
    </div>
  )
}

export default ProposalCard
