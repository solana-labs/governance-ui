import React, { FunctionComponent, useState } from 'react'
import { BanIcon, ThumbDownIcon, ThumbUpIcon } from '@heroicons/react/solid'
import { VoteKind } from '@solana/spl-governance'

import Button, { SecondaryButton } from './Button'
import Loading from './Loading'
import Modal from './Modal'
import Input from './inputs/Input'
import Tooltip from './Tooltip'
import { TokenOwnerRecord } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { useSubmitVote } from '@hooks/useSubmitVote'

interface VoteCommentModalProps {
  onClose: () => void
  isOpen: boolean
  vote: VoteKind
  voterTokenRecord: ProgramAccount<TokenOwnerRecord>
}

const VOTE_STRINGS = {
  [VoteKind.Approve]: 'Yes',
  [VoteKind.Deny]: 'No',
  [VoteKind.Veto]: 'Veto',
  [VoteKind.Abstain]: 'Abstain',
}

const VoteCommentModal: FunctionComponent<VoteCommentModalProps> = ({
  onClose,
  isOpen,
  vote,
  voterTokenRecord,
}) => {
  const [comment, setComment] = useState('')
  const { submitting, submitVote } = useSubmitVote()

  const voteString = VOTE_STRINGS[vote]

  const handleSubmit = async () => {
    await submitVote({
      vote,
      voterTokenRecord,
      comment,
    })
    onClose()
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Confirm your vote</h2>

      <Tooltip content="This will be stored on-chain and displayed publically in the discussion on this proposal">
        <label className="border- mt-4 border-dashed border-fgd-3 inline-block leading-4 text-fgd-1 text-sm hover:cursor-help hover:border-b-0">
          Leave a comment
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

      <div className="flex items-center justify-center mt-8">
        <SecondaryButton className="w-44 mr-4" onClick={onClose}>
          Cancel
        </SecondaryButton>

        <Button
          className="w-44 flex items-center justify-center"
          onClick={handleSubmit}
        >
          <div className="flex items-center">
            {!submitting &&
              (vote === VoteKind.Approve ? (
                <ThumbUpIcon className="h-4 w-4 fill-black mr-2" />
              ) : vote === VoteKind.Deny ? (
                <ThumbDownIcon className="h-4 w-4 fill-black mr-2" />
              ) : (
                <BanIcon className="h-4 w-4 fill-black mr-2" />
              ))}
            {submitting ? <Loading /> : <span>Vote {voteString}</span>}
          </div>
        </Button>
      </div>
    </Modal>
  )
}

export default React.memo(VoteCommentModal)
