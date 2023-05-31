import { CheckIcon } from '@heroicons/react/solid'
import ProposalStateBadge from './ProposalStateBadge'
import { Proposal, ProposalState } from '@solana/spl-governance'
import { ApprovalProgress, VetoProgress } from './QuorumProgress'
import useProposalVotes from '../hooks/useProposalVotes'
import ProposalTimeStatus from './ProposalTimeStatus'
import { PublicKey } from '@solana/web3.js'
import VoteResults from './VoteResults'
import { SelectedProposal } from 'pages/dao/[symbol]'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useAddressQuery_TokenOwnerRecord } from '@hooks/queries/addresses/tokenOwnerRecord'
import { useAddressQuery_VoteRecord } from '@hooks/queries/addresses/voteRecord'
import { useVoteRecordByPubkeyQuery } from '@hooks/queries/voteRecord'

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
  const realm = useRealmQuery().data?.result
  const wallet = useWalletOnePointOh()
  const { data: tokenOwnerRecordPk } = useAddressQuery_TokenOwnerRecord(
    realm?.owner,
    realm?.pubkey,
    proposal.governingTokenMint,
    wallet?.publicKey ?? undefined
  )
  const { data: voteRecordPk } = useAddressQuery_VoteRecord(
    realm?.owner,
    proposalPk,
    tokenOwnerRecordPk
  )
  const { data: ownVoteRecord } = useVoteRecordByPubkeyQuery(voteRecordPk)

  const votesData = useProposalVotes(proposal)

  const checked = !!selectedProposals.find(
    (p) => p.proposalPk.toString() === proposalPk.toString()
  )

  const toggleCheckbox = () => {
    if (checked) {
      const proposals = selectedProposals.filter(
        (p) => p.proposalPk.toString() !== proposalPk.toString()
      )
      setSelectedProposals(proposals)
    } else {
      setSelectedProposals([...selectedProposals, { proposal, proposalPk }])
    }
  }

  const myVoteExists = ownVoteRecord?.result !== undefined

  return myVoteExists ? undefined : (
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
          (votesData.veto.voteProgress ?? 0) > 0 ? (
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
    </button>
  )
}

export default ProposalSelectCard
