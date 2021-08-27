import { FunctionComponent, useState } from 'react'
import { postChatMessage } from '../actions/chat/postMessage'
import { ChatMessageBody, ChatMessageBodyType } from '../models/chat/accounts'
import { RpcContext } from '../models/core/api'
import useWalletStore from '../stores/useWalletStore'
import Button, { LinkButton } from './Button'
// import { notify } from '../utils/notifications'
import Loading from './Loading'
import Modal from './Modal'

interface MarketCloseModalProps {
  onClose: () => void
  isOpen: boolean
  comment: string
}

const CommentCostModal: FunctionComponent<MarketCloseModalProps> = ({
  onClose,
  isOpen,
  comment,
}) => {
  const [submitting, setSubmitting] = useState(false)

  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)

  const gasCost = 0.0001

  const submitComment = () => {
    setSubmitting(true)

    console.log('COMMENT', { wallet, connection, proposal })
    const rpcContext = new RpcContext(
      proposal.account.owner,
      wallet,
      connection.current,
      connection.endpoint
    )

    // TODO: Change to current
    const walletTokenOwnerRecord = proposal.info.tokenOwnerRecord
    const msg = new ChatMessageBody({
      type: ChatMessageBodyType.Text,
      value: comment,
    })

    postChatMessage(rpcContext, proposal, walletTokenOwnerRecord, msg).finally(
      () => {
        setSubmitting(false)
        onClose()
      }
    )
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2 className="pb-4 text-th-fgd-1">Posting will cost ~{gasCost} SOL</h2>
      <div className="flex items-center">
        <Button onClick={() => submitComment()}>
          {submitting ? <Loading /> : <span>Send It</span>}
        </Button>
        <LinkButton className="ml-4 text-th-fgd-1" onClick={onClose}>
          Cancel
        </LinkButton>
      </div>
    </Modal>
  )
}

export default CommentCostModal
