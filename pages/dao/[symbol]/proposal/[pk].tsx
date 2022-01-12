import Link from 'next/link'
import ReactMarkdown from 'react-markdown/react-markdown.min'
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/outline'
import useProposal from 'hooks/useProposal'
import ProposalStateBadge from 'components/ProposalStatusBadge'
import TokenBalanceCard from 'components/TokenBalanceCard'
import { InstructionPanel } from 'components/instructions/instructionPanel'
import DiscussionPanel from 'components/chat/DiscussionPanel'
import VotePanel from 'components/VotePanel'
import ApprovalQuorum from 'components/ApprovalQuorum'
import useRealm from 'hooks/useRealm'
import useProposalVotes from 'hooks/useProposalVotes'
import VoteResultsBar from 'components/VoteResultsBar'
import ProposalTimeStatus from 'components/ProposalTimeStatus'
import { option } from 'tools/core/option'
import useQueryContext from 'hooks/useQueryContext'
import React from 'react'
import ProposalActionsPanel from '@components/ProposalActions'
import { getRealmExplorerHost } from 'tools/routing'

const Proposal = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realmInfo } = useRealm()
  const { proposal, description } = useProposal()

  const {
    yesVoteProgress,
    yesVoteCount,
    noVoteCount,
    relativeNoVotes,
    relativeYesVotes,
  } = useProposalVotes(proposal?.account)

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 md:col-span-7 lg:col-span-8 space-y-3">
        {proposal ? (
          <>
            <div className="flex flex-items justify-between">
              <Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
                <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">
                  <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
                  Back
                </a>
              </Link>

              <div className="flex items-center">
                <a
                  href={`https://${getRealmExplorerHost(
                    realmInfo
                  )}/#/proposal/${proposal.pubkey.toBase58()}?programId=${proposal.owner.toBase58()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
                </a>
              </div>
            </div>

            <div className="border-b border-fgd-4 py-4">
              <div className="flex items-center justify-between mb-1">
                <h1 className="mr-2">{proposal?.account.name}</h1>
                <ProposalStateBadge
                  proposalPk={proposal.pubkey}
                  proposal={proposal.account}
                  open={true}
                />
              </div>
              <ProposalTimeStatus proposal={proposal?.account} />
            </div>

            {description && (
              <div className="pb-2">
                <ReactMarkdown className="markdown">
                  {description}
                </ReactMarkdown>
              </div>
            )}

            <InstructionPanel />
            <DiscussionPanel />
          </>
        ) : (
          <>
            <div className="animate-pulse bg-bkg-3 h-12 rounded-lg" />
            <div className="animate-pulse bg-bkg-3 h-64 rounded-lg" />
            <div className="animate-pulse bg-bkg-3 h-64 rounded-lg" />
          </>
        )}
      </div>

      <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4">
        <TokenBalanceCard proposal={option(proposal?.account)} />
        <div className="bg-bkg-2 rounded-lg">
          <div className="p-4 md:p-6">
            <h3 className="mb-4">Results</h3>
            <div className="flex space-x-4 items-center">
              {proposal ? (
                <div className="bg-bkg-1 flex px-4 py-2 rounded w-full">
                  <div className="border-r border-fgd-3 w-1/2">
                    <p className="text-fgd-3 text-xs">Approve</p>
                    <div className="font-bold text-sm">
                      {yesVoteCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="pl-4 w-1/2">
                    <p className="text-fgd-3 text-xs">Deny</p>
                    <div className="font-bold text-sm">
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
          <div className="border-t border-fgd-4 p-4 md:p-6 w-full">
            <div className="pb-4">
              <VoteResultsBar
                approveVotePercentage={relativeYesVotes!}
                denyVotePercentage={relativeNoVotes!}
              />
            </div>
            <ApprovalQuorum progress={yesVoteProgress} />
          </div>
        </div>

        <VotePanel />
        <ProposalActionsPanel />
      </div>
    </div>
  )
}

export default Proposal
