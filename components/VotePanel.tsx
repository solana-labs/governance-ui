import { castVote } from '../actions/castVote'
import { relinquishVote } from '../actions/relinquishVote'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import { ProposalState } from '../models/accounts'
import { RpcContext } from '../models/core/api'

import { Vote } from '../models/instructions'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'

const VotePanel = () => {
  const { governance, proposal, voteRecordsByVoter } = useWalletStore(
    (s) => s.selectedProposal
  )
  const { realm, ownTokenRecord } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { fetchVoteRecords } = useWalletStore((s) => s.actions)
  const connected = useWalletStore((s) => s.connected)
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal)
  const ownVoteRecord = voteRecordsByVoter[wallet?.publicKey?.toBase58()]

  const isVoteCast = ownVoteRecord !== undefined
  const isVoting =
    proposal?.info.state === ProposalState.Voting && !hasVoteTimeExpired

  const isVoteEnabled =
    connected &&
    isVoting &&
    !isVoteCast &&
    ownTokenRecord &&
    !ownTokenRecord.info.governingTokenDepositAmount.isZero()

  const isWithdrawEnabled =
    connected &&
    ownVoteRecord &&
    !ownVoteRecord?.info.isRelinquished &&
    (proposal.info.state === ProposalState.Voting ||
      proposal.info.state === ProposalState.Completed ||
      proposal.info.state === ProposalState.Cancelled ||
      proposal.info.state === ProposalState.Succeeded ||
      proposal.info.state === ProposalState.Executing ||
      proposal.info.state === ProposalState.Defeated)

  const submitVote = async (vote: Vote) => {
    const rpcContext = new RpcContext(
      proposal.account.owner,
      wallet,
      connection.current,
      connection.endpoint
    )
    try {
      await castVote(
        rpcContext,
        realm.pubkey,
        proposal,
        ownTokenRecord.pubkey,
        vote
      )
    } catch (ex) {
      console.error("Can't cast vote", ex)
    }

    fetchVoteRecords(proposal)
  }

  const submitRelinquishVote = async () => {
    const rpcContext = new RpcContext(
      proposal.account.owner,
      wallet,
      connection.current,
      connection.endpoint
    )
    try {
      await relinquishVote(
        rpcContext,
        proposal,
        ownTokenRecord.pubkey,
        ownVoteRecord.pubkey
      )
    } catch (ex) {
      console.error("Can't relinquish vote", ex)
    }

    fetchVoteRecords(proposal)
  }

  const actionLabel = !isVoteCast
    ? 'Cast your vote'
    : isVoting
    ? 'Withdraw your vote'
    : 'Release your tokens'

  return (
    <div className="bg-bkg-2 p-6 rounded-md space-y-6">
      <h2 className="mb-4 text-center">{actionLabel}</h2>
      <div className="flex items-center justify-center">
        {isVoteCast ? (
          <Button
            className="mx-2 w-44"
            onClick={() => submitRelinquishVote()}
            disabled={!isWithdrawEnabled}
          >
            {isVoting ? 'Withdraw vote' : 'Release tokens'}
          </Button>
        ) : (
          <>
            <Button
              className="mx-2 w-44"
              onClick={() => submitVote(Vote.Yes)}
              disabled={!isVoteEnabled}
            >
              Approve
            </Button>
            <Button
              className="mx-2 w-44"
              onClick={() => submitVote(Vote.No)}
              disabled={!isVoteEnabled}
            >
              Deny
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default VotePanel
