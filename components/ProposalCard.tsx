import styled from '@emotion/styled'
import { ChevronRightIcon } from '@heroicons/react/solid'
import ProposalStateBadge from './ProposalStatusBadge'
import Link from 'next/link'
import { Proposal, ProposalState } from '@solana/spl-governance'
import ApprovalQuorum from './ApprovalQuorum'
import useRealm from '../hooks/useRealm'
import useProposalVotes from '../hooks/useProposalVotes'
import VoteResultsBar from './VoteResultsBar'
import ProposalTimeStatus from './ProposalTimeStatus'

import useQueryContext from '../hooks/useQueryContext'
import { PublicKey } from '@solana/web3.js'

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
  const {
    yesVoteProgress,
    relativeNoVotes,
    relativeYesVotes,
  } = useProposalVotes(proposal)

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
                <h3 className="text-fgd-1">{proposal.name}</h3>
                <div className="flex items-center pl-4 pt-1">
                  <ProposalStateBadge
                    proposalPk={proposalPk}
                    proposal={proposal}
                    open={false}
                  />
                  <StyledSvg className="default-transition h-6 ml-2 text-primary-light w-6" />
                </div>
              </div>
              <ProposalTimeStatus proposal={proposal} />
            </div>
            {proposal.state === ProposalState.Voting && (
              <div className="border-t border-fgd-4 flex flex-col lg:flex-row mt-2 p-4">
                <div className="pb-3 lg:pb-0 lg:border-r lg:border-fgd-3 lg:pr-4 w-full lg:w-1/2">
                  <VoteResultsBar
                    approveVotePercentage={
                      relativeYesVotes ? relativeYesVotes : 0
                    }
                    denyVotePercentage={relativeNoVotes ? relativeNoVotes : 0}
                  />
                </div>
                <div className="lg:pl-4 w-full lg:w-1/2">
                  <ApprovalQuorum progress={yesVoteProgress} />
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
