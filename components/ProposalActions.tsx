import { useEffect, useState } from 'react';
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired';
import useRealm from '../hooks/useRealm';
import { getSignatoryRecordAddress } from '@solana/spl-governance';
import useWalletStore, {
  EnhancedProposalState,
} from '../stores/useWalletStore';
import Button, { SecondaryButton } from './Button';

import { RpcContext } from '@solana/spl-governance';
import { signOffProposal } from 'actions/signOffProposal';
import { notify } from '@utils/notifications';
import { finalizeVote } from 'actions/finalizeVotes';
import { Proposal } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { cancelProposal } from 'actions/cancelProposal';
import { getProgramVersionForRealm } from '@models/registry/api';

const ProposalActionsPanel = () => {
  const { governance, proposal, proposalOwner } = useWalletStore(
    (s) => s.selectedProposal,
  );
  const { realmInfo } = useRealm();
  const wallet = useWalletStore((s) => s.current);
  const connected = useWalletStore((s) => s.connected);
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!);
  const signatories = useWalletStore((s) => s.selectedProposal.signatories);
  const connection = useWalletStore((s) => s.connection);
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm);
  const [signatoryRecord, setSignatoryRecord] = useState<any>(undefined);

  const canFinalizeVote =
    hasVoteTimeExpired &&
    proposal?.account.state === EnhancedProposalState.Voting;

  const walletPk = wallet?.publicKey;

  useEffect(() => {
    const setup = async () => {
      if (proposal && realmInfo && walletPk) {
        const signatoryRecordPk = await getSignatoryRecordAddress(
          realmInfo.programId,
          proposal.pubkey,
          walletPk,
        );

        if (signatoryRecordPk && signatories) {
          setSignatoryRecord(signatories[signatoryRecordPk.toBase58()]);
        }
      }
    };

    setup();
  }, [proposal, realmInfo, walletPk]);

  const canSignOff =
    signatoryRecord &&
    (proposal?.account.state === EnhancedProposalState.Draft ||
      proposal?.account.state === EnhancedProposalState.SigningOff);

  const canCancelProposal =
    proposal &&
    governance &&
    proposalOwner &&
    wallet?.publicKey &&
    proposal.account.canWalletCancel(
      governance.account,
      proposalOwner.account,
      wallet.publicKey,
    );

  const signOffTooltipContent = !connected
    ? 'Connect your wallet to sign off this proposal'
    : !signatoryRecord
    ? 'Only a  signatory of the proposal can sign it off'
    : !(
        proposal?.account.state === EnhancedProposalState.Draft ||
        proposal?.account.state === EnhancedProposalState.SigningOff
      )
    ? 'Invalid proposal state. To sign off a proposal, it must be a draft or be in signing off state after creation.'
    : '';

  const cancelTooltipContent = !connected
    ? 'Connect your wallet to cancel this proposal'
    : proposal &&
      governance &&
      proposalOwner &&
      wallet?.publicKey &&
      !proposal?.account.canWalletCancel(
        governance.account,
        proposalOwner.account,
        wallet.publicKey,
      )
    ? 'Only the owner of the proposal can execute this action'
    : '';

  const finalizeVoteTooltipContent = !connected
    ? 'Connect your wallet to finalize this proposal'
    : !hasVoteTimeExpired
    ? "Vote time has not expired yet. You can finalize a vote only after it's time has expired."
    : proposal?.account.state === EnhancedProposalState.Voting &&
      !hasVoteTimeExpired
    ? 'Proposal is being voting right now, you need to wait the vote to finish to be able to finalize it.'
    : '';
  const handleFinalizeVote = async () => {
    try {
      if (proposal && realmInfo && governance) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint,
        );

        await finalizeVote(rpcContext, governance?.account.realm, proposal);
        await fetchRealm(realmInfo!.programId, realmInfo!.realmId);
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not finalize vote.`,
        description: `${error}`,
      });

      console.error('error finalizing vote', error);
    }
  };

  const handleSignOffProposal = async () => {
    try {
      if (proposal && realmInfo) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint,
        );

        await signOffProposal(
          rpcContext,
          realmInfo.realmId,
          proposal,
          signatoryRecord,
        );

        await fetchRealm(realmInfo!.programId, realmInfo!.realmId);
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not sign off proposal.`,
        description: `${error}`,
      });

      console.error('error sign off', error);
    }
  };
  const handleCancelProposal = async (
    proposal: ProgramAccount<Proposal> | undefined,
  ) => {
    try {
      if (proposal && realmInfo) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint,
        );

        await cancelProposal(rpcContext, realmInfo.realmId, proposal);

        await fetchRealm(realmInfo!.programId, realmInfo!.realmId);
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not cancel proposal.`,
        description: `${error}`,
      });

      console.error('error cancelling proposal', error);
    }
  };
  return (
    <>
      {EnhancedProposalState.Cancelled === proposal?.account.state ||
      EnhancedProposalState.Succeeded === proposal?.account.state ||
      EnhancedProposalState.Outdated === proposal?.account.state ||
      EnhancedProposalState.Defeated === proposal?.account.state ||
      (!canCancelProposal && !canSignOff && !canFinalizeVote) ? null : (
        <div>
          <div className="bg-bkg-2 rounded-lg p-6 space-y-6 flex justify-center items-center text-center flex-col w-full mt-4">
            {canSignOff && (
              <Button
                tooltipMessage={signOffTooltipContent}
                className="w-1/2"
                onClick={handleSignOffProposal}
                disabled={!connected || !canSignOff}
              >
                Sign Off
              </Button>
            )}

            {canCancelProposal && (
              <SecondaryButton
                tooltipMessage={cancelTooltipContent}
                className="w-1/2"
                onClick={() => handleCancelProposal(proposal)}
                disabled={!connected}
              >
                Cancel
              </SecondaryButton>
            )}

            {canFinalizeVote && (
              <Button
                tooltipMessage={finalizeVoteTooltipContent}
                className="w-1/2"
                onClick={handleFinalizeVote}
                disabled={!connected || !canFinalizeVote}
              >
                Finalize
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProposalActionsPanel;
