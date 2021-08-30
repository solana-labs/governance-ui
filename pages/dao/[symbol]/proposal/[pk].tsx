import Link from 'next/link'
import ReactMarkdown from 'react-markdown/react-markdown.min'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import useProposal from '../../../../hooks/useProposal'
import StatusBadge from '../../../../components/StatusBadge'
import TokenBalanceCard from '../../../../components/TokenBalanceCard'
import { InstructionPanel } from '../../../../components/instructions/instructionPanel'
import DiscussionPanel from '../../../../components/DiscussionPanel'
import VotePanel from '../../../../components/VotePanel'
import { ProposalState } from '../../../../models/accounts'

import ApprovalQuorum from '../../../../components/ApprovalQuorum'
import useRealm from '../../../../hooks/useRealm'
import useProposalVotes from '../../../../hooks/useProposalVotes'
import VoteResultsBar from '../../../../components/VoteResultsBar'

const Proposal = () => {
  const { symbol } = useRealm()
  const { proposal, description, instructions } = useProposal()
  const {
    yesVoteProgress,
    yesVoteCount,
    noVoteCount,
    relativeNoVotes,
    relativeYesVotes,
  } = useProposalVotes(proposal?.info)

  console.log('proposal data', { proposal, instructions })

  return (
    <div className="pb-10 pt-4">
      <Link href={`/dao/${symbol}/`}>
        <a className="flex items-center text-fgd-3">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          &nbsp; Back
        </a>
      </Link>
      <div className="pt-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 space-y-3">
            <div className="pb-1">
              <div className="pb-4">
                <h1 className="mb-1">{proposal?.info.name}</h1>
                <StatusBadge status={ProposalState[proposal?.info.state]} />
              </div>
              {description && (
                <ReactMarkdown className="markdown">
                  {description}
                </ReactMarkdown>
              )}
            </div>
            <div>
              <InstructionPanel />
            </div>
            <DiscussionPanel />
            <VotePanel />
          </div>
          <div className="col-span-4 space-y-4">
            <TokenBalanceCard />
            <div className="bg-bkg-2 rounded-md">
              <div className="p-6">
                <h3 className="mb-4">Results</h3>
                <div className="flex space-x-4 items-center">
                  {proposal ? (
                    <div className="bg-bkg-1 flex px-4 py-2 rounded w-full">
                      <div className="border-r border-bkg-4 w-1/2">
                        <p className="text-fgd-3 text-xs">Approve</p>
                        <div className="font-bold">
                          {yesVoteCount.toLocaleString()}
                        </div>
                      </div>
                      <div className="pl-4 w-1/2">
                        <p className="text-fgd-3 text-xs">Deny</p>
                        <div className="font-bold">
                          {noVoteCount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="animate-pulse bg-bkg-3 h-12 rounded w-full" />
                    </>
                  )}
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] p-6 w-full">
                <div className="pb-4">
                  <VoteResultsBar
                    approveVotePercentage={relativeYesVotes}
                    denyVotePercentage={relativeNoVotes}
                  />
                </div>
                <ApprovalQuorum progress={yesVoteProgress} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Proposal
