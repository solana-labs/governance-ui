import { CheckIcon } from '@heroicons/react/solid'
import ProposalStateBadge from './ProposalStatusBadge'
import { Proposal, ProposalState } from '@solana/spl-governance'
import ApprovalQuorum from './ApprovalQuorum'
import useProposalVotes from '../hooks/useProposalVotes'
import ProposalTimeStatus from './ProposalTimeStatus'
import { PublicKey } from '@solana/web3.js'
import VoteResults from './VoteResults'
import { SelectedProposal } from 'pages/dao/[symbol]'

type ProposalCardProps = {
  proposalPk: PublicKey
  proposal: Proposal
  setSelectedProposals: (val: SelectedProposal[]) => void
  selectedProposals: SelectedProposal[]
}

const ProposalSelectCard = ({
  proposalPk,
  proposal,
  setSelectedProposals,
  selectedProposals,
}: ProposalCardProps) => {
  const { yesVoteProgress, yesVotesRequired } = useProposalVotes(proposal)

  const checked = !!selectedProposals.find(
    // @ts-ignore
    (p) => p.proposalPk.toString() === proposalPk.toString()
  )

  const toggleCheckbox = () => {
    if (checked) {
      const proposals = selectedProposals.filter(
        // @ts-ignore
        (p) => p.proposalPk.toString() !== proposalPk.toString()
      )
      setSelectedProposals(proposals)
    } else {
      setSelectedProposals([...selectedProposals, { proposal, proposalPk }])
    }
  }

  return (
    <button
      className={`border ${
        checked ? 'border-primary-light' : 'border-fgd-4'
      } default-transition rounded-lg text-left w-full hover:bg-bkg-3`}
      onClick={() => toggleCheckbox()}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-fgd-1">{proposal.name}</h3>
          <div className="flex items-center pl-4 pt-1">
            <ProposalStateBadge proposal={proposal} />
            <div
              className={`bg-bkg-1 border ${
                checked ? 'border-primary-light' : 'border-fgd-4'
              } flex items-center justify-center ml-3 h-6 rounded-md w-6`}
            >
              {checked ? (
                <CheckIcon className="h-5 text-primary-light w-5" />
              ) : null}
            </div>
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
            <ApprovalQuorum
              progress={yesVoteProgress}
              yesVotesRequired={yesVotesRequired}
            />
          </div>
        </div>
      )}
    </button>
  )
}

export default ProposalSelectCard
