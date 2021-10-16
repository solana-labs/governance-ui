import styled from '@emotion/styled'
import { ChevronRightIcon } from '@heroicons/react/solid'
import StatusBadge from './StatusBadge'
import Link from 'next/link'
import { Proposal, ProposalState } from '../models/accounts'
import ApprovalQuorum from './ApprovalQuorum'
import useRealm from '../hooks/useRealm'
import useProposalVotes from '../hooks/useProposalVotes'
import VoteResultsBar from './VoteResultsBar'
import ProposalTimeStatus from './ProposalTimeStatus'
import useWalletStore from '../stores/useWalletStore'
import useQueryContext from '../hooks/useQueryContext'

type ProposalCardProps = {
  id: string
  proposal: Proposal
}

const StyledSvg = styled(ChevronRightIcon)``

const StyledCardWrapepr = styled.div`
  :hover {
    ${StyledSvg} {
      transform: translateX(4px);
    }
  }
`

const ProposalCard = ({ id, proposal }: ProposalCardProps) => {
  const { symbol } = useRealm()
  const { generateUrlWithClusterParam } = useQueryContext()
  const {
    yesVoteProgress,
    relativeNoVotes,
    relativeYesVotes,
  } = useProposalVotes(proposal)

  const ownVoteRecord = useWalletStore((s) => s.ownVoteRecordsByProposal)[id]

  let status = ProposalState[proposal.state]
  if (ownVoteRecord)
    status = status + ': ' + (ownVoteRecord.info.isYes() ? 'Yes' : 'No')

  return (
    <div>
      <Link href={generateUrlWithClusterParam(`/dao/${symbol}/proposal/${id}`)}>
        <a>
          <StyledCardWrapepr className="border border-fgd-4 default-transition rounded-lg hover:bg-bkg-3">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h3 className="text-fgd-1">{proposal.name}</h3>
                <div className="flex items-center pl-4 pt-1">
                  <StatusBadge status={status} />
                  <StyledSvg className="default-transition h-6 ml-2 text-primary-light w-6" />
                </div>
              </div>
              <ProposalTimeStatus proposal={proposal} />
            </div>
            {ProposalState[proposal.state] === 'Voting' && (
              <div className="border-t border-fgd-4 flex mt-2 p-4">
                <div className="border-r border-fgd-3 pr-4 w-1/2">
                  <VoteResultsBar
                    approveVotePercentage={
                      relativeYesVotes ? relativeYesVotes : 0
                    }
                    denyVotePercentage={relativeNoVotes ? relativeNoVotes : 0}
                  />
                </div>
                <div className="pl-4 w-1/2">
                  <ApprovalQuorum progress={yesVoteProgress} />
                </div>
              </div>
            )}
          </StyledCardWrapepr>
        </a>
      </Link>
    </div>
  )
}

export default ProposalCard
