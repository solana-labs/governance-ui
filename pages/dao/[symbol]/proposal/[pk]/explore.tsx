import { useState } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { ChevronLeftIcon } from '@heroicons/react/solid'

import useProposal from '@hooks/useProposal'
import useVoteRecords from '@hooks/useVoteRecords'
import ProposalStateBadge from '@components/ProposalStatusBadge'
import ProposalTopVotersList from '@components/ProposalTopVotersList'
import ProposalTopVotersBubbleChart from '@components/ProposalTopVotersBubbleChart'
import useWalletStore from 'stores/useWalletStore'
import useSignatories from '@hooks/useSignatories'
import ProposalSignatories from '@components/ProposalSignatories'
import ProposalVoteResult from '@components/ProposalVoteResults'
import ProposalRemainingVotingTime from '@components/ProposalRemainingVotingTime'

export default function Explore() {
  const { proposal, governance } = useProposal()
  const [highlighted, setHighlighted] = useState<string | undefined>()
  const connection = useWalletStore((s) => s.connection)
  const records = useVoteRecords(proposal)
  const signatories = useSignatories(proposal)
  const router = useRouter()

  const endpoint = connection.endpoint

  return (
    <div className="bg-bkg-2 rounded-lg p-4 space-y-3 md:p-6">
      <button
        className={classNames(
          'default-transition',
          'flex',
          'items-center',
          'text-fgd-2',
          'text-sm',
          'transition-all',
          'hover:text-fgd-3'
        )}
        onClick={router.back}
      >
        <ChevronLeftIcon className="h-6 w-6 " />
        Back
      </button>
      {proposal && governance ? (
        <div className="py-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="mr-2">{proposal?.account.name}</h1>
            <ProposalStateBadge
              proposalPk={proposal.pubkey}
              proposal={proposal.account}
              open={true}
            />
          </div>
          <h3 className="mb-4 mt-16">Top Voters</h3>
          <div
            className="grid gap-4 grid-cols-1 items-center lg:grid-cols-2"
            onMouseLeave={() => setHighlighted(undefined)}
          >
            <ProposalTopVotersList
              className="h-[500px]"
              data={records}
              endpoint={endpoint}
              highlighted={highlighted}
              onHighlight={setHighlighted}
            />
            <ProposalTopVotersBubbleChart
              className="h-[500px]"
              data={records}
              endpoint={endpoint}
              highlighted={highlighted}
              onHighlight={setHighlighted}
            />
          </div>
          <div className="grid gap-4 grid-cols-1 mt-16 lg:grid-cols-3">
            <ProposalSignatories
              endpoint={endpoint}
              proposal={proposal}
              signatories={signatories}
            />
            <ProposalVoteResult
              className="text-center"
              data={records}
              governance={governance}
              proposal={proposal}
            />
            <ProposalRemainingVotingTime
              align="right"
              governance={governance}
              proposal={proposal}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="animate-pulse bg-bkg-3 h-12 rounded-lg" />
          <div className="animate-pulse bg-bkg-3 h-[500px] rounded-lg mt-16" />
          <div className="animate-pulse bg-bkg-3 h-52 rounded-lg mt-16" />
        </div>
      )}
    </div>
  )
}
