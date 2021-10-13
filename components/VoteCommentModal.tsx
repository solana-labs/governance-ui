import React, { FunctionComponent, useState } from 'react'
import { postChatMessage } from '../actions/chat/postMessage'
import { ChatMessageBody, ChatMessageBodyType } from '../models/chat/accounts'
import { RpcContext } from '../models/core/api'
import useWalletStore from '../stores/useWalletStore'
import useRealm from '../hooks/useRealm'
import { castVote } from '../actions/castVote'
import { Vote } from '../models/instructions'
import Button, { LinkButton } from './Button'
// import { notify } from '../utils/notifications'
import Loading from './Loading'
import Modal from './Modal'
import Input from './inputs/Input'
import Tooltip from './Tooltip'
import { TokenOwnerRecord } from '../models/accounts'
import { ParsedAccount } from '../models/core/accounts'

interface VoteCommentModalProps {
  onClose: () => void
  isOpen: boolean
  vote: Vote
  voterTokenRecord: ParsedAccount<TokenOwnerRecord>
}

const VoteCommentModal: FunctionComponent<VoteCommentModalProps> = ({
  onClose,
  isOpen,
  vote,
  voterTokenRecord,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [comment, setComment] = useState('')
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { fetchChatMessages } = useWalletStore((s) => s.actions)
  const { fetchVoteRecords } = useWalletStore((s) => s.actions)
  const { realm, realmInfo } = useRealm()
  const { fetchRealm } = useWalletStore((s) => s.actions)

  const submitVote = async (vote: Vote) => {
    setSubmitting(true)
    const rpcContext = new RpcContext(
      proposal.account.owner,
      wallet,
      connection.current,
      connection.endpoint
    )

    const msg = new ChatMessageBody({
      type: ChatMessageBodyType.Text,
      value: comment,
    })

    try {
      await castVote(
        rpcContext,
        realm.pubkey,
        proposal,
        voterTokenRecord.pubkey,
        vote
      )
      if (comment) {
        await postChatMessage(
          rpcContext,
          proposal,
          voterTokenRecord.pubkey,
          msg
        )
      }
    } catch (ex) {
      //TODO: How do we present transaction errors to users? Just the notification?
      console.error("Can't cast vote", ex)
      onClose()
    } finally {
      setSubmitting(false)
      onClose()
    }

    fetchChatMessages(proposal.pubkey)
    fetchVoteRecords(proposal)
    await fetchRealm(realmInfo.programId, realmInfo.realmId)
  }

  const voteString = vote === 0 ? 'Approve' : 'Deny'

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Confirm your vote</h2>
      <Tooltip content="This will be stored on-chain and displayed publically in the discussion on this proposal">
        <label className="border-b border-dashed border-fgd-3 inline-block leading-4 text-fgd-1 hover:cursor-help hover:border-b-0">
          Care to comment on your decision?
        </label>
        <span className="ml-1 text-xs text-fgd-3">(Optional)</span>
      </Tooltip>
      <Input
        className="mt-1.5"
        value={comment}
        type="text"
        onChange={(e) => setComment(e.target.value)}
        // placeholder={`Let the DAO know why you vote '${voteString}'`}
      />
      <div className="flex items-center pt-6">
        <Button onClick={() => submitVote(vote)}>
          {submitting ? <Loading /> : <span>{voteString} Proposal</span>}
        </Button>
        <LinkButton className="ml-4 text-th-fgd-1" onClick={onClose}>
          Cancel
        </LinkButton>
      </div>
    </Modal>
  )
}

export default React.memo(VoteCommentModal)
