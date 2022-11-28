import { VoteKind } from '@solana/spl-governance'
import { useState } from 'react'
import { ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid'
import Button from '../Button'
import VoteCommentModal from '../VoteCommentModal'
import { useVoterTokenRecord, useVotingPop } from './hooks'

export const CastVoteButtons = ({
  voteTooltipContent,
  isVoteEnabled,
}: {
  voteTooltipContent: string
  isVoteEnabled: boolean
}) => {
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState<'yes' | 'no' | null>(null)
  const votingPop = useVotingPop()
  const voterTokenRecord = useVoterTokenRecord()

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-center">Cast your {votingPop} vote</h3>
      </div>

      <div className="items-center justify-center flex w-full gap-5">
        <div className="w-full flex justify-between items-center gap-5">
          <Button
            tooltipMessage={voteTooltipContent}
            className="w-1/2"
            onClick={() => {
              setVote('yes')
              setShowVoteModal(true)
            }}
            disabled={!isVoteEnabled}
          >
            <div className="flex flex-row items-center justify-center">
              <ThumbUpIcon className="h-4 w-4 mr-2" />
              Vote Yes
            </div>
          </Button>

          <Button
            tooltipMessage={voteTooltipContent}
            className="w-1/2"
            onClick={() => {
              setVote('no')
              setShowVoteModal(true)
            }}
            disabled={!isVoteEnabled}
          >
            <div className="flex flex-row items-center justify-center">
              <ThumbDownIcon className="h-4 w-4 mr-2" />
              Vote No
            </div>
          </Button>
        </div>
      </div>

      {showVoteModal && vote ? (
        <VoteCommentModal
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          vote={vote === 'yes' ? VoteKind.Approve : VoteKind.Deny}
          voterTokenRecord={voterTokenRecord!}
        />
      ) : null}
    </div>
  )
}
