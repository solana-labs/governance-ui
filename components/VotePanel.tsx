/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { withFinalizeVote } from '@models/withFinalizeVote'
import { TransactionInstruction } from '@solana/web3.js'
import { useCallback, useState } from 'react'
import { relinquishVote } from '../actions/relinquishVote'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import { ProposalState } from '../models/accounts'
import { RpcContext } from '../models/core/api'
import { GoverningTokenType } from '../models/enums'

import { Vote } from '../models/instructions'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'
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

  const withdrawTooltipContent = !connected
    ? 'You need to connect your wallet'
    : !isWithdrawEnabled
    ? !ownVoteRecord?.info.isRelinquished
      ? 'Owner vote record is not relinquished'
      : 'The proposal is not in a valid state to execute this action.'
    : ''

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : !isVoteEnabled
    ? !isVoting && isVoteCast
      ? 'Proposal is not in a voting state anymore.'
      : !voterTokenRecord
      ? 'No voter token record found.'
      : voterTokenRecord.info.governingTokenDepositAmount.isZero()
      ? 'No governing token deposit amount found. You need to deposit some tokens first.'
      : ''
    : ''

  return (
    <>
      {ProposalState.Cancelled === proposal?.info.state ||
      ProposalState.Succeeded === proposal?.info.state ||
      ProposalState.Draft === proposal?.info.state ||
      !isVoting ? null : (
        <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-6">
          <h2 className="mb-4 text-center">{actionLabel}</h2>

          <div className="items-center justify-center flex w-full gap-5">
            {isVoteCast ? (
              <Button
                tooltipMessage={withdrawTooltipContent}
                onClick={() => submitRelinquishVote()}
                disabled={!isWithdrawEnabled}
              >
                {isVoting ? 'Withdraw' : 'Release Tokens'}
              </Button>
            ) : (
              <>
                {isVoting && (
                  <div className="w-full flex justify-between items-center gap-5">
                    <Button
                      tooltipMessage={voteTooltipContent}
                      className="w-1/2"
                      onClick={() => handleShowVoteModal(Vote.Yes)}
                      disabled={!isVoteEnabled}
                    >
                      Approve
                    </Button>

                    <Button
                      tooltipMessage={voteTooltipContent}
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
          </div>

          {showVoteModal ? (
            <VoteCommentModal
              isOpen={showVoteModal}
              onClose={handleCloseShowVoteModal}
              vote={vote!}
              voterTokenRecord={voterTokenRecord!}
            />
          ) : null}
        </div>
      )}
    </>
  )
}

export default VotePanel
