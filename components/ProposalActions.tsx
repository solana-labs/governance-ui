/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import { getSignatoryRecordAddress, ProposalState } from '../models/accounts'
import useWalletStore from '../stores/useWalletStore'
import Button, { SecondaryButton } from './Button'
import CancelProposalModal from './CancelProposalModal'
import FinalizeVotesModal from './FinalizeVotesModal'
import SignOffProposalModal from './SignOffProposalModal'
import Tooltip from './Tooltip'

const ProposalActionsPanel = () => {
  const { governance, proposal, proposalOwner } = useWalletStore(
    (s) => s.selectedProposal
  )
  const { realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)
  const signatories = useWalletStore((s) => s.selectedProposal.signatories)

  const [showSignOffModal, setShowSignOffModal] = useState(false)
  const [signatoryRecord, setSignatoryRecord] = useState<any>(undefined)
  const [showFinalizeVoteModal, setShowFinalizeVoteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const canFinalizeVote =
    hasVoteTimeExpired === true &&
    connected &&
    proposal?.info.state === ProposalState.Voting

  const walletPk = wallet?.publicKey

  useEffect(() => {
    const setup = async () => {
      if (proposal && realmInfo && walletPk) {
        const signatoryRecordPk = await getSignatoryRecordAddress(
          realmInfo.programId,
          proposal.pubkey,
          walletPk
        )

        if (signatoryRecordPk && signatories) {
          setSignatoryRecord(signatories[signatoryRecordPk.toBase58()])
        }
      }
    }

    setup()
  }, [proposal, realmInfo, walletPk])

  const canSignOff =
    signatoryRecord &&
    (proposal?.info.state === ProposalState.Draft ||
      proposal?.info.state === ProposalState.SigningOff)

  const canCancelProposal =
    proposal &&
    governance &&
    proposalOwner &&
    wallet?.publicKey &&
    proposal.info.canWalletCancel(
      governance.info,
      proposalOwner.info,
      wallet.publicKey
    )

  const signOffTooltipContent = !connected
    ? 'Connect your wallet to sign off this proposal'
    : !signatoryRecord
    ? 'No signatory record'
    : !(
        proposal?.info.state === ProposalState.Draft ||
        proposal?.info.state === ProposalState.SigningOff
      )
    ? 'Invalid proposal state. To sign off a proposal, it must be a draft or be in signing off state after creation.'
    : ''

  const cancelTooltipContent = !connected
    ? 'Connect your wallet to cancel this proposal'
    : proposal &&
      governance &&
      proposalOwner &&
      wallet?.publicKey &&
      !proposal?.info.canWalletCancel(
        governance.info,
        proposalOwner.info,
        wallet.publicKey
      )
    ? 'Only the owner of the proposal can execute this action'
    : ''

  const finalizeVoteTooltipContent = !connected
    ? 'Connect your wallet to finalize this proposal'
    : !hasVoteTimeExpired
    ? "Vote time has not expired yet. You can finalize a vote only after it's time has expired."
    : proposal?.info.state === ProposalState.Voting
    ? 'Proposal is being voting right now, you need to wait the vote to finish to be able to finalize it.'
    : ''

  return (
    <>
      {ProposalState.Cancelled === proposal?.info.state ||
      ProposalState.Succeeded === proposal?.info.state ||
      ProposalState.Defeated === proposal?.info.state ||
      (!canCancelProposal && !canSignOff && canFinalizeVote) ? null : (
        <div>
          <div className="bg-bkg-2 rounded-lg p-6 space-y-6 flex justify-center items-center text-center flex-col w-full mt-4">
            {canSignOff && (
              <Button
                tooltipMessage={signOffTooltipContent}
                className="w-1/2"
                onClick={() => setShowSignOffModal(true)}
                disabled={!connected || !canSignOff}
              >
                Sign Off
              </Button>
            )}

            {canCancelProposal && (
              <SecondaryButton
                tooltipMessage={cancelTooltipContent}
                className="w-1/2"
                onClick={() => setShowCancelModal(true)}
                disabled={!connected}
              >
                Cancel
              </SecondaryButton>
            )}

            {canFinalizeVote && (
              <Button
                tooltipMessage={finalizeVoteTooltipContent}
                className="w-1/2"
                onClick={() => setShowFinalizeVoteModal(true)}
                disabled={!connected || !canFinalizeVote}
              >
                Finalize
              </Button>
            )}
          </div>

          {showSignOffModal && (
            <SignOffProposalModal
              isOpen={showSignOffModal && canSignOff}
              onClose={() => setShowSignOffModal(false)}
              signatoryRecord={signatoryRecord}
            />
          )}

          {showFinalizeVoteModal && (
            <FinalizeVotesModal
              isOpen={showFinalizeVoteModal && canFinalizeVote}
              onClose={() => setShowFinalizeVoteModal(false)}
              proposal={proposal}
              governance={governance}
            />
          )}

          {showCancelModal && (
            <CancelProposalModal
              // @ts-ignore
              isOpen={showCancelModal && canCancelProposal}
              onClose={() => setShowCancelModal(false)}
            />
          )}
        </div>
      )}
    </>
  )
}

export default ProposalActionsPanel
