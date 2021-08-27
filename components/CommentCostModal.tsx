import { FunctionComponent, useState } from 'react'
import { postChatMessage } from '../actions/chat/postMessage'
import { TokenOwnerRecord } from '../models/accounts'
import { ChatMessageBody, ChatMessageBodyType } from '../models/chat/accounts'
import { ParsedAccount } from '../models/core/accounts'
import { RpcContext } from '../models/core/api'
import useWalletStore from '../stores/useWalletStore'
import Button, { LinkButton } from './Button'
// import { notify } from '../utils/notifications'
import Loading from './Loading'
import Modal from './Modal'

interface MarketCloseModalProps {
  onClose: (success: boolean) => void
  isOpen: boolean
  comment: string
  ownTokenRecord: ParsedAccount<TokenOwnerRecord>
}

const CommentCostModal: FunctionComponent<MarketCloseModalProps> = ({
  onClose,
  isOpen,
  comment,
  ownTokenRecord,
}) => {
  const [submitting, setSubmitting] = useState(false)

  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { fetchChatMessages } = useWalletStore((s) => s.actions)

  const gasCost = 0.0016

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
      onClose(true)
    } catch {
      //TODO: How do we present transaction errors to users? Just the notification?
      onClose(false)
    } finally {
      setSubmitting(false)
    }

    fetchChatMessages(proposal.pubkey)
  }

  return (
    <Modal onClose={() => onClose(false)} isOpen={isOpen}>
      <h2 className="pb-4 text-th-fgd-1">Posting will cost ~{gasCost} SOL</h2>
      <div className="flex items-center">
        <Button onClick={() => submitComment()}>
          {submitting ? <Loading /> : <span>Send It</span>}
        </Button>
        <LinkButton
          className="ml-4 text-th-fgd-1"
          onClick={() => onClose(false)}
        >
          Cancel
        </LinkButton>
      </div>
    </Modal>
  )
}

export default CommentCostModal
