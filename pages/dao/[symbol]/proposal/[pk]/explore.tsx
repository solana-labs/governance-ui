import { useState } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { ChevronLeftIcon } from '@heroicons/react/solid'

import { useProposalGovernanceQuery } from '@hooks/useProposal'
import useVoteRecords from '@hooks/useVoteRecords'
import ProposalStateBadge from '@components/ProposalStateBadge'
import ProposalTopVotersList from '@components/ProposalTopVotersList'
import ProposalTopVotersBubbleChart from '@components/ProposalTopVotersBubbleChart'
import useSignatories from '@hooks/useSignatories'
import ProposalSignatories from '@components/ProposalSignatories'
import ProposalVoteResult from '@components/ProposalVoteResults'
import ProposalRemainingVotingTime from '@components/ProposalRemainingVotingTime'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { VoteType } from '@solana/spl-governance'
import MultiChoiceVotes from '@components/MultiChoiceVotes'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import ProposalVoterNftChart from '@components/ProposalVoterNftChart'
import { NFT_PLUGINS_PKS } from '@constants/plugins'

export default function Explore() {
  const proposal = useRouteProposalQuery().data?.result
  const governance = useProposalGovernanceQuery().data?.result
  const [highlighted, setHighlighted] = useState<string | undefined>()
  const connection = useLegacyConnectionContext()
  const records = useVoteRecords(proposal)
  const signatories = useSignatories(proposal)
  const router = useRouter()

  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin
  const isNftMode =
    currentPluginPk && NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58())

  const endpoint = connection.endpoint

  const handleExploreBackClick = () => {
    const newPath = router.asPath.replace(/\/explore$/, '')
    router.push(newPath)
  }
  const isMulti = proposal?.account.voteType !== VoteType.SINGLE_CHOICE

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
        onClick={handleExploreBackClick}
      >
        <ChevronLeftIcon className="h-6 w-6 " />
        Back
      </button>
      {proposal && governance ? (
        <div className="py-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="mr-2">{proposal?.account.name}</h1>
            <ProposalStateBadge proposal={proposal.account} />
          </div>
          <div className="mb-4 mt-16 flex justify-between">
            <h3 className="">Top Voters</h3>
          </div>
          <div
            className="grid gap-4 grid-cols-1 items-center lg:grid-cols-2"
            onMouseLeave={() => setHighlighted(undefined)}
          >
            <div className="flex flex-col gap-5 h-[500px]">
              <ProposalTopVotersList
                className={isNftMode ? 'h-[275px]' : 'h-[500px]'}
                data={records}
                endpoint={endpoint}
                isMulti={isMulti}
                highlighted={highlighted}
                onHighlight={setHighlighted}
              />
              {/* when hovering over a top voter, ProposalVoterNftChart shows he/her NFTs when isNftMode */}
              <ProposalVoterNftChart
                className="h-[205px]"
                highlighted={highlighted}
                voteType={
                  highlighted && records
                    ? records.find((x) => x.key === highlighted)?.voteType
                    : undefined
                }
              />
            </div>
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
            {isMulti ? (
              <div className="text-center">
                <h3 className="mb-3">Vote Result</h3>
                <MultiChoiceVotes
                  proposal={proposal.account}
                  limit={proposal.account.options.length}
                />
              </div>
            ) : (
              <ProposalVoteResult
                className="text-center"
                data={records}
                governance={governance}
                proposal={proposal}
              />
            )}
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
