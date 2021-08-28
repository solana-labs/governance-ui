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

import { calculatePct, fmtTokenAmount } from '../../../../utils/formatting'
import ApprovalProgress from '../../../../components/ApprovalProgress'
import useRealm from '../../../../hooks/useRealm'

const Proposal = () => {
  const { symbol, mint } = useRealm()
  const { proposal, description, instructions } = useProposal()

  const yesVotePct = proposal
    ? calculatePct(proposal.info.yesVotesCount, mint?.supply)
    : null

  const yesVoteProgress =
    (yesVotePct / proposal?.info.voteThresholdPercentage?.value) * 100

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
                    <>
                      <div className="bg-bkg-1 px-4 py-2 rounded w-full">
                        <p className="text-fgd-3 text-xs">Approve</p>
                        <div className="font-bold">
                          {fmtTokenAmount(
                            proposal?.info.yesVotesCount,
                            mint?.decimals
                          )}
                        </div>
                      </div>
                      <div className="bg-bkg-1 px-4 py-2 rounded w-full">
                        <p className="text-fgd-3 text-xs">Deny</p>
                        <div className="font-bold">
                          {fmtTokenAmount(
                            proposal?.info.noVotesCount,
                            mint?.decimals
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="animate-pulse bg-bkg-3 h-10 rounded w-full" />
                      <div className="animate-pulse bg-bkg-3 h-10 rounded w-full" />
                    </>
                  )}
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
