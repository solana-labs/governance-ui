import ApprovalQuorum from '@components/ApprovalQuorum'
import Button from '@components/Button'
import VoteResults from '@components/VoteResults'
import { ThumbUpIcon } from '@heroicons/react/solid'
import { useHasVoteTimeExpired } from '@hooks/useHasVoteTimeExpired'
import useRealmProposalVotes from '@hooks/useRealmProposalVotes'
import useWallet from '@hooks/useWallet'
import {
  Governance,
  ProgramAccount,
  Proposal,
  ProposalState,
  Realm,
  TokenOwnerRecord,
  VoteRecord,
  YesNoVote,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'
import { useCallback, useState } from 'react'
import VoteProposalModal from './VoteProposalModal'

function getLabel(proposalState: ProposalState, hasVotingExpired?: boolean) {
  switch (proposalState) {
    case ProposalState.Cancelled:
      return 'Cancelled'
    case ProposalState.Completed:
      return 'Completed'
    case ProposalState.Defeated:
      return 'Defeated'
    case ProposalState.Draft:
      return 'Draft'
    case ProposalState.Executing:
      return 'Executable'
    case ProposalState.ExecutingWithErrors:
      return 'Executing w/ errors'
    case ProposalState.SigningOff:
      return 'Signing off'
    case ProposalState.Succeeded:
      return 'Completed'
    case ProposalState.Voting:
      return hasVotingExpired ? 'Finalizing' : 'Voting'
  }
}

function getTextColor(
  proposalState: ProposalState,
  hasVotingExpired?: boolean
) {
  switch (proposalState) {
    case ProposalState.Cancelled:
    case ProposalState.Draft:
      return 'text-white'
    case ProposalState.Completed:
      return 'text-[#8EFFDD]'
    case ProposalState.Defeated:
    case ProposalState.ExecutingWithErrors:
      return 'text-[#FF7C7C]'
    case ProposalState.Executing:
      return 'text-[#5DC9EB]'
    case ProposalState.SigningOff:
      return 'text-[#F5A458]'
    case ProposalState.Succeeded:
      return 'text-[#8EFFDD]'

    case ProposalState.Voting:
      return hasVotingExpired
        ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent'
        : 'text-[#8EFFDD]'
  }
}

function getBorderColor(
  proposalState: ProposalState,
  hasVotingExpired?: boolean
) {
  switch (proposalState) {
    case ProposalState.Cancelled:
    case ProposalState.Completed:
    case ProposalState.Defeated:
    case ProposalState.ExecutingWithErrors:
      return 'border-transparent'
    case ProposalState.Executing:
      return 'border-[#5DC9EB]'
    case ProposalState.Draft:
      return 'border-white'
    case ProposalState.SigningOff:
      return 'border-[#F5A458]'
    case ProposalState.Succeeded:
      return 'border-transparent'

    case ProposalState.Voting:
      return hasVotingExpired ? 'border-[#5DC9EB]' : 'border-[#8EFFDD]'
  }
}

function getOpacity(proposalState: ProposalState) {
  switch (proposalState) {
    case ProposalState.Cancelled:
    case ProposalState.Completed:
    case ProposalState.Defeated:
    case ProposalState.ExecutingWithErrors:
      return 'opacity-70'
    case ProposalState.Draft:
      return ''
    case ProposalState.SigningOff:
      return ''
    case ProposalState.Succeeded:
      return 'opacity-70'
    default:
      return ''
  }
}

interface Props {
  voteRecord?: ProgramAccount<VoteRecord>
  proposal: ProgramAccount<Proposal>
  proposalGovernance?: ProgramAccount<Governance>
  currentGovernance?: ProgramAccount<Governance>
  realm: ProgramAccount<Realm>
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>
  programId?: PublicKey | null
}
export default function ProposalDetails({
  voteRecord,
  proposal,
  proposalGovernance,
  currentGovernance,
  realm,
  tokenOwnerRecord,
  programId,
}: Props) {
  const { wallet } = useWallet()
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState<YesNoVote | null>(null)

  const voteData = useRealmProposalVotes(
    proposal.account,
    realm.account,
    proposalGovernance?.account
  )

  const hasVoteTimeExpired = useHasVoteTimeExpired(proposalGovernance, proposal)

  const isVoteCast = voteRecord !== undefined
  const isVoting =
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired

  const handleCloseShowVoteModal = useCallback(() => {
    setShowVoteModal(false)
  }, [])
  const handleShowVoteModal = (vote: YesNoVote) => {
    setVote(vote)
    setShowVoteModal(true)
  }

  return (
    <div className="rounded-md bg-bkg-2 p-4 flex flex-col space-y-4">
      <div className="flex justify-between border-b border-fgd-4 pb-3">
        <div className="flex flex-col">
          <p className="text-xl font-bold">{proposal.account.name}</p>
        </div>
        <div
          className={classNames(
            'border',
            'inline-flex',
            'min-w-max',
            'items-center',
            'px-2',
            'py-1',
            'rounded-full',
            'text-xs',
            getBorderColor(proposal.account.state, hasVoteTimeExpired),
            getOpacity(proposal.account.state),
            getTextColor(proposal.account.state, hasVoteTimeExpired)
          )}
        >
          {getLabel(proposal.account.state, hasVoteTimeExpired)}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row space-y-1 lg:space-y-0 lg:space-x-3">
        <div className="flex-1">
          <VoteResults isListView proposal={proposal.account} />
        </div>
        <div className="hidden lg:block self-stretch w-0.5 bg-fgd-4" />
        <div className="flex-1">
          <ApprovalQuorum
            progress={voteData.yesVoteProgress}
            yesVotesRequired={voteData.yesVotesRequired}
          />
        </div>
      </div>
      {isVoting && (
        <>
          <div className="flex space-x-2">
            <Button
              className="flex-1"
              disabled={isVoteCast || !wallet || !wallet.publicKey}
              onClick={() => handleShowVoteModal(YesNoVote.Yes)}
              tooltipMessage={
                !wallet || !wallet.publicKey
                  ? 'Please connect your wallet.'
                  : undefined
              }
            >
              <div className="flex flex-row items-center justify-center">
                <ThumbUpIcon className="h-4 w-4 mr-2" />
                Vote Yes
              </div>
            </Button>
            <Button
              className="flex-1"
              disabled={isVoteCast || !wallet || !wallet.publicKey}
              onClick={() => handleShowVoteModal(YesNoVote.No)}
              tooltipMessage={
                !wallet || !wallet.publicKey
                  ? 'Please connect your wallet.'
                  : undefined
              }
            >
              <div className="flex flex-row items-center justify-center">
                <ThumbUpIcon className="h-4 w-4 mr-2" />
                Vote No
              </div>
            </Button>
          </div>
          {showVoteModal ? (
            <VoteProposalModal
              isOpen={showVoteModal}
              onClose={handleCloseShowVoteModal}
              vote={vote!}
              proposal={proposal}
              voterTokenRecord={tokenOwnerRecord}
              realm={realm}
              programId={programId}
              currentGovernance={currentGovernance}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
