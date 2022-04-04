import { PublicKey } from '@solana/web3.js'
import useRealmGovernance from '../hooks/useRealmGovernance'
import { Proposal, ProposalState } from '@solana/spl-governance'
import useWalletStore from '../stores/useWalletStore'
import { isYesVote } from '@models/voteRecords'

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
      statusLabel + ': ' + (isYesVote(ownVoteRecord.account) ? 'Yes' : 'No')
  }

  return (
    <>
      {open ? (
        <>
          <div className="flex items-center justify-end gap-4">
            <div
              className={`${getProposalStateStyle(
                proposal.state
              )} inline-block px-2 py-1 rounded-full text-xs`}
            >
              {statusLabel}
            </div>
          </div>
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
