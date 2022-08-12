import { PublicKey } from '@solana/web3.js';
import useRealmGovernance from '../hooks/useRealmGovernance';
import useWalletStore, {
  EnhancedProposal,
  EnhancedProposalState,
} from '../stores/useWalletStore';
import { isYesVote } from '@models/voteRecords';

function getProposalStateLabel(
  state: EnhancedProposalState,
  hasVoteEnded: boolean,
) {
  switch (state) {
    case EnhancedProposalState.ExecutingWithErrors:
      return 'Execution Errors';
    case EnhancedProposalState.Voting:
      // If there is no tipping point and voting period ends then proposal stays in Voting state and needs to be manually finalized
      return hasVoteEnded ? 'Finalizing' : 'Voting';
    default:
      return EnhancedProposalState[state];
  }
}

function getProposalStateStyle(state: EnhancedProposalState) {
  if (
    state === EnhancedProposalState.Voting ||
    state === EnhancedProposalState.Executing ||
    state === EnhancedProposalState.SigningOff
  ) {
    return 'border border-blue text-blue';
  }

  if (
    state === EnhancedProposalState.Completed ||
    state === EnhancedProposalState.Succeeded
  ) {
    return 'border border-green text-green';
  }

  if (
    state === EnhancedProposalState.Cancelled ||
    state === EnhancedProposalState.Defeated ||
    state === EnhancedProposalState.ExecutingWithErrors
  ) {
    return 'border border-red text-red';
  }

  return 'border border-fgd-3 text-fgd-3';
}

const ProposalStateBadge = ({
  proposalPk,
  proposal,
  open,
}: {
  proposalPk: PublicKey;
  proposal: EnhancedProposal;
  open: boolean;
}) => {
  const governance = useRealmGovernance(proposal.governance);

  const ownVoteRecord = useWalletStore((s) => s.ownVoteRecordsByProposal)[
    proposalPk.toBase58()
  ];

  let statusLabel = getProposalStateLabel(
    proposal.state,
    governance && proposal.getTimeToVoteEnd(governance) < 0,
  );

  if (ownVoteRecord) {
    statusLabel =
      statusLabel + ': ' + (isYesVote(ownVoteRecord.account) ? 'Yes' : 'No');
  }

  return (
    <>
      {open ? (
        <>
          <div className="flex items-center justify-end gap-4">
            <div
              className={`${getProposalStateStyle(
                proposal.state,
              )} inline-block px-2 py-1 rounded-full text-xs whitespace-nowrap`}
            >
              {statusLabel}
            </div>
          </div>
        </>
      ) : (
        <div
          className={`${getProposalStateStyle(
            proposal.state,
          )} inline-block px-2 py-1 rounded-full text-xs whitespace-nowrap`}
        >
          {statusLabel}
        </div>
      )}
    </>
  );
};

export default ProposalStateBadge;
