/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { withFinalizeVote, YesNoVote } from '@solana/spl-governance'
import { TransactionInstruction } from '@solana/web3.js'
import { useCallback, useState } from 'react'
import { relinquishVote } from '../actions/relinquishVote'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import { ProposalState } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { GoverningTokenType } from '@solana/spl-governance'

import useWalletStore from '../stores/useWalletStore'
import Button, { SecondaryButton } from './Button'
import VoteCommentModal from './VoteCommentModal'
import { getProgramVersionForRealm } from '@models/registry/api'

const VotePanel = () => {
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState<YesNoVote | null>(null)
  const {
    governance,
    proposal,
    voteRecordsByVoter,
    tokenType,
  } = useWalletStore((s) => s.selectedProposal)
  const {
    ownTokenRecord,
    ownCouncilTokenRecord,
    realm,
    realmInfo,
    ownVoterWeight,
  } = useRealm()
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
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired

  const isVoteEnabled =
    connected &&
    isVoting &&
    !isVoteCast &&
    voterTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      voterTokenRecord.account.governingTokenMint
    )

  const isWithdrawEnabled =
    connected &&
    ownVoteRecord &&
    !ownVoteRecord?.account.isRelinquished &&
    proposal &&
    (proposal!.account.state === ProposalState.Voting ||
      proposal!.account.state === ProposalState.Completed ||
      proposal!.account.state === ProposalState.Cancelled ||
      proposal!.account.state === ProposalState.Succeeded ||
      proposal!.account.state === ProposalState.Executing ||
      proposal!.account.state === ProposalState.Defeated)

  const submitRelinquishVote = async () => {
    const programId = realmInfo?.programId
    const realmId = realmInfo?.realmId
    const rpcContext = new RpcContext(
      proposal!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint
    )
    try {
      const instructions: TransactionInstruction[] = []

      if (
        proposal?.account.state === ProposalState.Voting &&
        hasVoteTimeExpired
      ) {
        await withFinalizeVote(
          instructions,
          realmInfo!.programId,
          getProgramVersionForRealm(realmInfo!),
          realm!.pubkey,
          proposal.account.governance,
          proposal.pubkey,
          proposal.account.tokenOwnerRecord,
          proposal.account.governingTokenMint
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

    await fetchRealm(programId, realmId)
  }

  const handleShowVoteModal = (vote: YesNoVote) => {
    setVote(vote)
    setShowVoteModal(true)
  }

  const handleCloseShowVoteModal = useCallback(() => {
    setShowVoteModal(false)
  }, [])

  const actionLabel =
    !isVoteCast || !connected
      ? 'Cast your vote'
      : isVoting
      ? 'Withdraw your vote'
      : 'Release your tokens'

  const withdrawTooltipContent = !connected
    ? 'You need to connect your wallet'
    : !isWithdrawEnabled
    ? !ownVoteRecord?.account.isRelinquished
      ? 'Owner vote record is not relinquished'
      : 'The proposal is not in a valid state to execute this action.'
    : ''

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : !isVoting && isVoteCast
    ? 'Proposal is not in a voting state anymore.'
    : !voterTokenRecord ||
      !ownVoterWeight.hasMinAmountToVote(
        voterTokenRecord.account.governingTokenMint
      )
    ? 'You don’t have governance power to vote in this realm'
    : ''

  const notVisibleStatesForNotConnectedWallet = [
    ProposalState.Cancelled,
    ProposalState.Succeeded,
    ProposalState.Draft,
    ProposalState.Completed,
  ]

  const isVisibleToWallet = !connected
    ? !hasVoteTimeExpired &&
      typeof notVisibleStatesForNotConnectedWallet.find(
        (x) => x === proposal?.account.state
      ) === 'undefined'
    : !ownVoteRecord?.account.isRelinquished

  const isPanelVisible = (isVoting || isVoteCast) && isVisibleToWallet
  return (
    <>
      {isPanelVisible && (
        <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
          <h3 className="mb-4 text-center">{actionLabel}</h3>

          <div className="items-center justify-center flex w-full gap-5">
            {isVoteCast && connected ? (
              <SecondaryButton
                small
                tooltipMessage={withdrawTooltipContent}
                onClick={() => submitRelinquishVote()}
                disabled={!isWithdrawEnabled}
              >
                {isVoting ? 'Withdraw' : 'Release Tokens'}
              </SecondaryButton>
            ) : (
              <>
                {isVoting && (
                  <div className="w-full flex justify-between items-center gap-5">
                    <Button
                      tooltipMessage={voteTooltipContent}
                      className="w-1/2"
                      onClick={() => handleShowVoteModal(YesNoVote.Yes)}
                      disabled={!isVoteEnabled}
                    >
                      Vote Yes
                    </Button>

                    <Button
                      tooltipMessage={voteTooltipContent}
                      className="w-1/2"
                      onClick={() => handleShowVoteModal(YesNoVote.No)}
                      disabled={!isVoteEnabled}
                    >
                      Vote No
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
