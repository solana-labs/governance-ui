/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import { getSignatoryRecordAddress, ProposalState } from '../models/accounts'
import { RpcContext } from '../models/core/api'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'
import CancelProposalModal from './CancelProposalModal'
import FinalizeVotesModal from './FinalizeVotesModal'
import SignOffProposalModal from './SignOffProposalModal'

const ProposalActionsPanel = () => {
  const { governance, proposal, proposalOwner } = useWalletStore(
    (s) => s.selectedProposal
  )
  const { realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
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

  return (
    <>
      {ProposalState.Cancelled === proposal?.info.state ||
      ProposalState.Succeeded === proposal?.info.state ? null : (
        <div>
          <div className="bg-bkg-2 rounded-lg p-6 space-y-6 flex justify-center items-center text-center flex-col w-full mt-4">
            {canSignOff && (
              <Button
                className="w-1/2"
                onClick={() => setShowSignOffModal(true)}
                disabled={!connected || !canSignOff}
              >
                Sign Off
              </Button>
            )}

            {canCancelProposal && (
              <Button
                className="w-1/2"
                onClick={() => setShowCancelModal(true)}
                disabled={!connected}
              >
                Cancel
              </Button>
            )}

            {canFinalizeVote && (
              <Button
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
