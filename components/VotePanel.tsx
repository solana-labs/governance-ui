/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { withFinalizeVote } from '@models/withFinalizeVote'
import { TransactionInstruction } from '@solana/web3.js'
import { useCallback, useEffect, useState } from 'react'
import { relinquishVote } from '../actions/relinquishVote'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import { getSignatoryRecordAddress, ProposalState } from '../models/accounts'
import { RpcContext } from '../models/core/api'
import { GoverningTokenType } from '../models/enums'

import { Vote } from '../models/instructions'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'
import CancelProposalModal from './CancelProposalModal'
import FinalizeVotesModal from './FinalizeVotesModal'
import SignOffProposalModal from './SignOffProposalModal'
import VoteCommentModal from './VoteCommentModal'

const VotePanel = () => {
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState(null)
  const {
    governance,
    proposal,
    voteRecordsByVoter,
    tokenType,
  } = useWalletStore((s) => s.selectedProposal)
  const { ownTokenRecord, ownCouncilTokenRecord, realm, realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm)
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)
  const signatories = useWalletStore((s) => s.selectedProposal.signatories)

  const [showSignOffModal, setShowSignOffModal] = useState(false)
  const [signatoryRecord, setSignatoryRecord] = useState<any>(undefined)
  const [showFinalizeVoteModal, setShowFinalizeVoteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const tokenRecords = useWalletStore((s) => s.selectedRealm)

  const canFinalizeVote =
    hasVoteTimeExpired === true &&
    connected &&
    proposal?.info.state === ProposalState.Voting

  useEffect(() => {
    const setup = async () => {
      if (connected && proposal && realmInfo && wallet) {
        const rpcContext = new RpcContext(
          proposal.account.owner,
          realmInfo.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        const response = await getSignatoryRecordAddress(
          rpcContext.programId,
          proposal.pubkey,
          rpcContext.walletPubkey
        )

        if (response && signatories) {
          setSignatoryRecord(signatories[response.toBase58()])
        }
      }
    }

    setup()
  }, [proposal])

  const ownVoteRecord =
    wallet?.publicKey && voteRecordsByVoter[wallet.publicKey.toBase58()]

  const voterTokenRecord =
    tokenType === GoverningTokenType.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord

  const isVoteCast = ownVoteRecord !== undefined
  const isVoting =
    proposal?.info.state === ProposalState.Voting && !hasVoteTimeExpired

  const isVoteEnabled =
    connected &&
    isVoting &&
    !isVoteCast &&
    voterTokenRecord &&
    !voterTokenRecord.info.governingTokenDepositAmount.isZero()

  const isWithdrawEnabled =
    connected &&
    ownVoteRecord &&
    !ownVoteRecord?.info.isRelinquished &&
    proposal &&
    (proposal!.info.state === ProposalState.Voting ||
      proposal!.info.state === ProposalState.Completed ||
      proposal!.info.state === ProposalState.Cancelled ||
      proposal!.info.state === ProposalState.Succeeded ||
      proposal!.info.state === ProposalState.Executing ||
      proposal!.info.state === ProposalState.Defeated)

  const submitRelinquishVote = async () => {
    const rpcContext = new RpcContext(
      proposal!.account.owner,
      realmInfo?.programVersion,
      wallet,
      connection.current,
      connection.endpoint
    )
    try {
      const instructions: TransactionInstruction[] = []

      if (proposal?.info.state === ProposalState.Voting && hasVoteTimeExpired) {
        await withFinalizeVote(
          instructions,
          realmInfo!.programId,
          realm!.pubkey,
          proposal.info.governance,
          proposal.pubkey,
          proposal.info.tokenOwnerRecord,
          proposal.info.governingTokenMint
        )
      }

      await relinquishVote(
        rpcContext,
        proposal!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        voterTokenRecord!.pubkey,
        ownVoteRecord!.pubkey,
        instructions
      )
    } catch (ex) {
      console.error("Can't relinquish vote", ex)
    }

    await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
  }

  const handleShowVoteModal = (vote) => {
    setVote(vote)
    setShowVoteModal(true)
  }

  const handleCloseShowVoteModal = useCallback(() => {
    setShowVoteModal(false)
  }, [])

  const actionLabel = !isVoteCast
    ? 'Cast your vote'
    : isVoting
    ? 'Withdraw your vote'
    : 'Release your tokens'

  const canSignOff =
    signatoryRecord &&
    (proposal?.info.state === ProposalState.Draft ||
      proposal?.info.state === ProposalState.SigningOff)

  const canCancelProposal =
    !(
      proposal?.info.state === ProposalState.Draft ||
      proposal?.info.state === ProposalState.SigningOff ||
      proposal?.info.state === ProposalState.Cancelled ||
      proposal?.info.state === ProposalState.Succeeded
    ) &&
    proposal &&
    wallet?.publicKey

  return (
    <>
      {ProposalState.Cancelled === proposal?.info.state ||
      ProposalState.Succeeded === proposal?.info.state ? null : (
        <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-6">
          <h2 className="mb-4 text-center">{actionLabel}</h2>
          <div
            className={`${
              ProposalState.Draft === proposal?.info.state ||
              !canCancelProposal ||
              isVoteCast
                ? 'items-center justify-center'
                : 'items-start justify-start'
            } flex flex-wrap w-full gap-5`}
          >
            {isVoteCast ? (
              <Button
                onClick={() => submitRelinquishVote()}
                disabled={!isWithdrawEnabled}
              >
                {isVoting ? 'Withdraw' : 'Release Tokens'}
              </Button>
            ) : (
              <>
                {isVoting && (
                  <div
                    className={`${
                      canSignOff || canCancelProposal || canFinalizeVote
                        ? 'border-b border-gray-600 pb-5'
                        : ''
                    } w-full flex justify-between items-center gap-x-5`}
                  >
                    <Button
                      className="w-1/2"
                      onClick={() => handleShowVoteModal(Vote.Yes)}
                      disabled={!isVoteEnabled}
                    >
                      Approve
                    </Button>
                    <Button
                      className="w-1/2"
                      onClick={() => handleShowVoteModal(Vote.No)}
                      disabled={!isVoteEnabled}
                    >
                      Deny
                    </Button>
                  </div>
                )}
              </>
            )}

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
                className={
                  ProposalState.Completed === proposal?.info.state ||
                  ProposalState.Voting === proposal?.info.state ||
                  ProposalState.ExecutingWithErrors === proposal?.info.state
                    ? 'w-1/2'
                    : 'w-full'
                }
                onClick={() => setShowCancelModal(true)}
                disabled={!connected}
              >
                Cancel
              </Button>
            )}

            {canFinalizeVote && (
              <Button
                className={isVoting ? 'w-full' : ''}
                onClick={() => setShowFinalizeVoteModal(true)}
                disabled={!connected || !canFinalizeVote}
              >
                Finalize
              </Button>
            )}
          </div>

          {showVoteModal ? (
            <VoteCommentModal
              isOpen={showVoteModal}
              onClose={handleCloseShowVoteModal}
              vote={vote!}
              voterTokenRecord={voterTokenRecord!}
            />
          ) : null}

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

export default VotePanel
