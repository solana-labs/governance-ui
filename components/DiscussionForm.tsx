import { useState } from 'react'
import Button from './Button'
import Input from './Input'
import CommentCostModal from './CommentCostModal'

const DiscussionForm = () => {
  const [comment, setComment] = useState('')
  const [showCostModal, setShowCostModal] = useState(false)

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
          onClick={() => setShowCostModal(true)}
        >
          Post Comment
        </Button>
      </div>
      {showCostModal ? (
        <CommentCostModal
          isOpen={showCostModal}
          onClose={() => setShowCostModal(false)}
          comment={comment}
        />
      ) : null}
    </>
  )
}

export default DiscussionForm
