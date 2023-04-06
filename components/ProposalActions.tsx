/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import {
  getSignatoryRecordAddress,
  ProposalState,
} from '@solana/spl-governance'
import useWalletStore from '../stores/useWalletStore'
import Button, { SecondaryButton } from './Button'

import { RpcContext } from '@solana/spl-governance'
import { signOffProposal } from 'actions/signOffProposal'
import { notify } from '@utils/notifications'
import { finalizeVote } from 'actions/finalizeVotes'
import { Proposal } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { cancelProposal } from 'actions/cancelProposal'
import { getProgramVersionForRealm } from '@models/registry/api'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import dayjs from 'dayjs'
import { diffTime } from './ProposalRemainingVotingTime'
import { useMaxVoteRecord } from '@hooks/useMaxVoteRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

const ProposalActionsPanel = () => {
  const { governance, proposal, proposalOwner } = useWalletStore(
    (s) => s.selectedProposal
  )
  const { realmInfo } = useRealm()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)
  const signatories = useWalletStore((s) => s.selectedProposal.signatories)
  const connection = useWalletStore((s) => s.connection)
  const refetchProposals = useWalletStore((s) => s.actions.refetchProposals)
  const [signatoryRecord, setSignatoryRecord] = useState<any>(undefined)
  const maxVoteRecordPk = useMaxVoteRecord()?.pubkey
  const votePluginsClientMaxVoterWeight = useVotePluginsClientStore(
    (s) => s.state.maxVoterWeight
  )
  const maxVoterWeight = maxVoteRecordPk || votePluginsClientMaxVoterWeight
  const canFinalizeVote =
    hasVoteTimeExpired && proposal?.account.state === ProposalState.Voting
  const now = new Date().getTime() / 1000 // unix timestamp in seconds
  const mainVotingEndedAt = proposal?.account.signingOffAt
    ?.addn(governance?.account.config.baseVotingTime || 0)
    .toNumber()

  const votingCoolOffTime = governance?.account.config.votingCoolOffTime || 0
  const canFinalizeAt = mainVotingEndedAt
    ? mainVotingEndedAt + votingCoolOffTime
    : mainVotingEndedAt

  const canFinalizeNow = canFinalizeAt ? canFinalizeAt <= now : true
  const endOfProposalAndCoolOffTime = canFinalizeAt
    ? dayjs(1000 * canFinalizeAt!)
    : undefined
  const coolOffTimeLeft = endOfProposalAndCoolOffTime
    ? diffTime(false, dayjs(), endOfProposalAndCoolOffTime)
    : undefined

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [proposal?.pubkey.toBase58(), realmInfo?.symbol, walletPk?.toBase58()])

  const canSignOff =
    signatoryRecord &&
    (proposal?.account.state === ProposalState.Draft ||
      proposal?.account.state === ProposalState.SigningOff)

  const canCancelProposal =
    proposal &&
    governance &&
    proposalOwner &&
    wallet?.publicKey &&
    proposal.account.canWalletCancel(
      governance.account,
      proposalOwner.account,
      wallet.publicKey
    )

  const signOffTooltipContent = !connected
    ? 'Connect your wallet to sign off this proposal'
    : !signatoryRecord
    ? 'Only a  signatory of the proposal can sign it off'
    : !(
        proposal?.account.state === ProposalState.Draft ||
        proposal?.account.state === ProposalState.SigningOff
      )
    ? 'Invalid proposal state. To sign off a proposal, it must be a draft or be in signing off state after creation.'
    : ''

  const cancelTooltipContent = !connected
    ? 'Connect your wallet to cancel this proposal'
    : proposal &&
      governance &&
      proposalOwner &&
      wallet?.publicKey &&
      !proposal?.account.canWalletCancel(
        governance.account,
        proposalOwner.account,
        wallet.publicKey
      )
    ? 'Only the owner of the proposal can execute this action'
    : ''

  const finalizeVoteTooltipContent = !connected
    ? 'Connect your wallet to finalize this proposal'
    : !hasVoteTimeExpired
    ? "Vote time has not expired yet. You can finalize a vote only after it's time has expired."
    : proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired
    ? 'Proposal is being voting right now, you need to wait the vote to finish to be able to finalize it.'
    : ''
  const handleFinalizeVote = async () => {
    try {
      if (proposal && realmInfo && governance) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint
        )

        await finalizeVote(
          rpcContext,
          governance?.account.realm,
          proposal,
          maxVoterWeight
        )
        await refetchProposals()
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not finalize vote.`,
        description: `${error}`,
      })

      console.error('error finalizing vote', error)
    }
  }

  const handleSignOffProposal = async () => {
    try {
      if (proposal && realmInfo) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint
        )

        await signOffProposal(
          rpcContext,
          realmInfo.realmId,
          proposal,
          signatoryRecord
        )

        await refetchProposals()
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not sign off proposal.`,
        description: `${error}`,
      })

      console.error('error sign off', error)
    }
  }
  const handleCancelProposal = async (
    proposal: ProgramAccount<Proposal> | undefined
  ) => {
    try {
      if (proposal && realmInfo) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint
        )

        await cancelProposal(rpcContext, realmInfo.realmId, proposal)

        await refetchProposals()
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not cancel proposal.`,
        description: `${error}`,
      })

      console.error('error cancelling proposal', error)
    }
  }
  return (
    <>
      {ProposalState.Cancelled === proposal?.account.state ||
      ProposalState.Succeeded === proposal?.account.state ||
      ProposalState.Defeated === proposal?.account.state ||
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
                Cancel Proposal
              </SecondaryButton>
            )}

            {canFinalizeVote && (
              <>
                <Button
                  tooltipMessage={finalizeVoteTooltipContent}
                  className="w-1/2"
                  onClick={handleFinalizeVote}
                  disabled={!connected || !canFinalizeVote || !canFinalizeNow}
                >
                  Finalize
                </Button>
                {!canFinalizeNow && coolOffTimeLeft && (
                  <div>
                    Cool Off Time: {coolOffTimeLeft.days}d &nbsp;
                    {coolOffTimeLeft.hours}h &nbsp;
                    {coolOffTimeLeft.minutes}m
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ProposalActionsPanel
