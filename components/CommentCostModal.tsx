import { FunctionComponent, useState } from 'react'
import Button, { LinkButton } from './Button'
// import { notify } from '../utils/notifications'
import Loading from './Loading'
import Modal from './Modal'

interface MarketCloseModalProps {
  onClose: () => void
  isOpen: boolean
}

const CommentCostModal: FunctionComponent<MarketCloseModalProps> = ({
  onClose,
  isOpen,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const gasCost = 0.0001

  const submitComment = () => {
    setSubmitting(true)
    //   do stuff...
    setSubmitting(false)
    onClose()
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
