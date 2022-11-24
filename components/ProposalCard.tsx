import styled from '@emotion/styled'
import { ChevronRightIcon } from '@heroicons/react/solid'
import ProposalStateBadge from './ProposalStatusBadge'
import Link from 'next/link'
import { Proposal, ProposalState } from '@solana/spl-governance'
import { ApprovalProgress } from './QuorumProgress'
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
  const { yesVoteProgress, yesVotesRequired } = useProposalVotes(proposal)

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
              <div className="border-t border-fgd-4 flex flex-col lg:flex-row mt-2 p-4">
                <div className="pb-3 lg:pb-0 lg:border-r lg:border-fgd-4 lg:pr-4 w-full lg:w-1/2">
                  <VoteResults isListView proposal={proposal} />
                </div>
                <div className="lg:pl-4 w-full lg:w-1/2">
                  <ApprovalProgress
                    progress={yesVoteProgress}
                    votesRequired={yesVotesRequired}
                  />
                </div>
              </div>
            )}
          </StyledCardWrapper>
        </a>
      </Link>
    </div>
  )
}

export default ProposalCard
