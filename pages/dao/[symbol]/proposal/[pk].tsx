import { Disclosure } from '@headlessui/react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown/react-markdown.min'
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/outline'
import useProposal from '../../../../hooks/useProposal'
import StatusBadge from '../../../../components/StatusBadge'
import TokenBalanceCard from '../../../../components/TokenBalanceCard'
import DiscussionPanel from '../../../../components/DiscussionPanel'
import VotePanel from '../../../../components/VotePanel'
import { ProposalState } from '../../../../models/accounts'

import ApprovalProgress from '../../../../components/ApprovalProgress'
import useRealm from '../../../../hooks/useRealm'
import useProposalVotes from '../../../../hooks/useProposalVotes'

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
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button
                      className={`bg-bkg-2 font-bold px-6 py-4 text-fgd-1 rounded-md transition-all w-full hover:bg-bkg-3 focus:outline-none ${
                        open && 'rounded-b-none'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="mb-0">Instructions</h2>
                        <ChevronDownIcon
                          className={`h-5 text-primary-light transition-all w-5 ${
                            open
                              ? 'transform rotate-180'
                              : 'transform rotate-360'
                          }`}
                        />
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel className={`bg-bkg-2 p-6 rounded-b-md`}>
                      Instructions go here...
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
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
              <div className="bg-[rgba(255,255,255,0.05)] px-6 py-4 w-full">
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
              <ApprovalProgress progress={yesVoteProgress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Proposal
