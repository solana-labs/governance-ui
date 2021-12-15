import { PublicKey } from '@solana/web3.js'
import CancelProposal from 'pages/dao/[symbol]/proposal/components/CancelProposal'
import FinalizeVotes from 'pages/dao/[symbol]/proposal/components/FinalizeVotes'
import { useState } from 'react'
import useRealmGovernance from '../hooks/useRealmGovernance'
import { Proposal, ProposalState } from '../models/accounts'
import useWalletStore from '../stores/useWalletStore'

function getProposalStateLabel(state: ProposalState, hasVoteEnded: boolean) {
  switch (state) {
    case ProposalState.ExecutingWithErrors:
      return 'Execution Errors'
    case ProposalState.Voting:
      // If there is no tipping point and voting period ends then proposal stays in Voting state and needs to be manually finalized
      return hasVoteEnded ? 'Finalizing' : 'Voting'
    default:
      return ProposalState[state]
  }
}

function getProposalStateStyle(state: ProposalState) {
  if (
    state === ProposalState.Voting ||
    state === ProposalState.Executing ||
    state === ProposalState.SigningOff
  ) {
    return 'border border-blue text-blue'
  } else if (
    state === ProposalState.Completed ||
    state === ProposalState.Succeeded
  ) {
    return 'border border-green text-green'
  } else if (
    state === ProposalState.Cancelled ||
    state === ProposalState.Defeated ||
    state === ProposalState.ExecutingWithErrors
  ) {
    return 'border border-red text-red'
  } else {
    return 'border border-fgd-3 text-fgd-3'
  }
}

const ProposalStateBadge = ({
  proposalPk,
  proposal,
  open,
}: {
  proposalPk: PublicKey
  proposal: Proposal
  open: boolean
}) => {
  const [showFinalizeVoteModal, setShowFinalizeVoteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const governance = useRealmGovernance(proposal.governance)

  const ownVoteRecord = useWalletStore((s) => s.ownVoteRecordsByProposal)[
    proposalPk.toBase58()
  ]

  let statusLabel = getProposalStateLabel(
    proposal.state,
    governance && proposal.getTimeToVoteEnd(governance) < 0
  )

  if (ownVoteRecord) {
    statusLabel =
      statusLabel + ': ' + (ownVoteRecord.info.isYes() ? 'Yes' : 'No')
  }

  return (
    <>
      {open ? (
        <>
          <div className="flex items-center justify-end gap-4">
            {governance && proposal.getTimeToVoteEnd(governance) < 0 && (
              <p
                onClick={() => setShowFinalizeVoteModal(true)}
                className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1 mr-4"
              >
                Finalize vote
              </p>
            )}

            {ProposalState.Cancelled === proposal?.state ||
            !(
              proposal.state === ProposalState.Draft ||
              proposal.state === ProposalState.SigningOff ||
              proposal.state === ProposalState.Voting
            ) ? null : (
              <p
                onClick={() => setShowCancelModal(true)}
                className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1 mr-4"
              >
                Cancel
              </p>
            )}

            <div
              className={`${getProposalStateStyle(
                proposal.state
              )} inline-block px-2 py-1 rounded-full text-xs`}
            >
              {statusLabel}
            </div>
          </div>

          {showFinalizeVoteModal && (
            <FinalizeVotes
              isOpen={showFinalizeVoteModal}
              onClose={() => setShowFinalizeVoteModal(false)}
            />
          )}

          {showCancelModal && (
            <CancelProposal
              isOpen={showCancelModal}
              onClose={() => setShowCancelModal(false)}
            />
          )}
        </>
      ) : (
        <div
          className={`${getProposalStateStyle(
            proposal.state
          )} inline-block px-2 py-1 rounded-full text-xs`}
        >
          {statusLabel}
        </div>
      )}
    </>
  )
}

export default ProposalStateBadge
