import { useState } from 'react'
import Button from './Button'
import Input from './Input'
import useWalletStore from '../stores/useWalletStore'
import useRealm from '../hooks/useRealm'
import { RpcContext } from '../models/core/api'
import { ChatMessageBody, ChatMessageBodyType } from '../models/chat/accounts'
import { postChatMessage } from '../actions/chat/postMessage'
import Loading from './Loading'

const DiscussionForm = () => {
  const [comment, setComment] = useState('')
  const connected = useWalletStore((s) => s.connected)
  const { ownTokenRecord } = useRealm()

  const [submitting, setSubmitting] = useState(false)

  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { fetchChatMessages } = useWalletStore((s) => s.actions)

  const submitComment = async () => {
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
      await postChatMessage(rpcContext, proposal, ownTokenRecord.pubkey, msg)
      setComment('')
    } catch {
      //TODO: How do we present transaction errors to users? Just the notification?
    } finally {
      setSubmitting(false)
    }

    fetchChatMessages(proposal.pubkey)
  }

  const postEnabled =
    connected &&
    ownTokenRecord &&
    !ownTokenRecord.info.governingTokenDepositAmount.isZero() &&
    comment

  return (
    <>
      <div className="flex space-x-4">
        <Input
          value={comment}
          type="text"
          onChange={(e) => setComment(e.target.value)}
        />
        <Button
          className="flex-shrink-0"
          onClick={() => submitComment()}
          disabled={!postEnabled}
        >
          {submitting ? <Loading /> : <span>Send It</span>}
        </Button>
      </div>
    </>
  )
}

export default DiscussionForm
