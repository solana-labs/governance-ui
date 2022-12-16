import styled from '@emotion/styled'
import { ChevronRightIcon } from '@heroicons/react/solid'
import ProposalStateBadge from './ProposalStateBadge'
import Link from 'next/link'
import { Proposal, ProposalState } from '@solana/spl-governance'
import { ApprovalProgress, VetoProgress } from './QuorumProgress'
import useRealm from '../hooks/useRealm'
import useProposalVotes from '../hooks/useProposalVotes'
import ProposalTimeStatus from './ProposalTimeStatus'
import ProposalMyVoteBadge from '../components/ProposalMyVoteBadge'

import useQueryContext from '../hooks/useQueryContext'
import { PublicKey } from '@solana/web3.js'
import VoteResults from './VoteResults'

type ProposalCardProps = {
  proposalPk: PublicKey
  proposal: Proposal
}

const StyledSvg = styled(ChevronRightIcon)``

const StyledCardWrapper = styled.div`
  :hover {
    ${StyledSvg} {
      transform: translateX(4px);
    }
  }
`

const ProposalCard = ({ proposalPk, proposal }: ProposalCardProps) => {
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const votesData = useProposalVotes(proposal)

  return (
    <div>
      <Link
        href={fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalPk.toBase58()}`
        )}
      >
        <a>
          <StyledCardWrapper className="border border-fgd-4 default-transition rounded-lg hover:bg-bkg-3">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h3 className="text-fgd-1 overflow-wrap-anywhere">
                  {proposal.name}
                </h3>
                <div className="flex items-center pl-4 pt-1">
                  {proposal.state === ProposalState.Voting && (
                    <ProposalMyVoteBadge
                      className="mr-2"
                      proposal={{ account: proposal, pubkey: proposalPk }}
                    />
                  )}
                  <ProposalStateBadge proposal={proposal} />
                  <StyledSvg className="default-transition h-6 ml-3 text-fgd-2 w-6" />
                </div>
              </div>
              <ProposalTimeStatus proposal={proposal} />
            </div>
            {proposal.state === ProposalState.Voting && (
              <div className="border-t border-fgd-4 flex flex-col lg:flex-row mt-2 p-4 gap-x-4 gap-y-3">
                <div className="w-full lg:w-auto flex-1">
                  <VoteResults isListView proposal={proposal} />
                </div>
                <div className="border-r border-fgd-4 hidden lg:block" />
                <div className="w-full lg:w-auto flex-1">
                  <ApprovalProgress
                    progress={votesData.yesVoteProgress}
                    votesRequired={votesData.yesVotesRequired}
                  />
                </div>
                {votesData._programVersion !== undefined &&
                // @asktree: here is some typescript gore because typescript doesn't know that a number being > 3 means it isn't 1 or 2
                votesData._programVersion !== 1 &&
                votesData._programVersion !== 2 &&
                votesData.veto !== undefined &&
                votesData.veto.voteProgress > 0 ? (
                  <>
                    <div className="border-r border-fgd-4 hidden lg:block" />

                    <div className="w-full lg:w-auto flex-1">
                      <VetoProgress
                        progress={votesData.veto.voteProgress}
                        votesRequired={votesData.veto.votesRequired}
                      />
                    </div>
                  </>
                ) : undefined}
              </div>
            )}
          </StyledCardWrapper>
        </a>
      </Link>
    </div>
  )
}

export default ProposalCard
