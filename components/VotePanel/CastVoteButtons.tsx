import { VoteKind } from '@solana/spl-governance'
import { useState } from 'react'
import { ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid'
import Button from '../Button'
import VoteCommentModal from '../VoteCommentModal'
import {
  useIsVoting,
  useProposalVoteRecordQuery,
  useVoterTokenRecord,
  useVotingPop,
} from './hooks'
import useRealm from '@hooks/useRealm'
import { VotingClientType } from '@utils/uiTypes/VotePlugin'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'

const useCanVote = () => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const { ownVoterWeight } = useRealm()
  const connected = useWalletStore((s) => s.connected)

  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')
  const voterTokenRecord = useVoterTokenRecord()

  const isVoteCast = !!ownVoteRecord?.found

  const hasMinAmountToVote =
    voterTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      voterTokenRecord.account.governingTokenMint
    )

  console.log(client.clientType)
  console.log(VotingClientType.HeliumVsrClient)
  const canVote =
    connected &&
    !(
      client.clientType === VotingClientType.NftVoterClient && !voterTokenRecord
    ) &&
    !isVoteCast &&
    hasMinAmountToVote

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : client.clientType === VotingClientType.NftVoterClient && !voterTokenRecord
    ? 'You must join the Realm to be able to vote'
    : !hasMinAmountToVote
    ? 'You don’t have governance power to vote in this dao'
    : ''
  return [canVote, voteTooltipContent] as const
}

export const CastVoteButtons = () => {
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState<'yes' | 'no' | null>(null)
  const votingPop = useVotingPop()
  const voterTokenRecord = useVoterTokenRecord()

  const [canVote, tooltipContent] = useCanVote()
  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')

  const isVoteCast = !!ownVoteRecord?.found
  const isVoting = useIsVoting()

  return isVoting && !isVoteCast ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-center">Cast your {votingPop} vote</h3>
      </div>

      <div className="items-center justify-center flex w-full gap-5">
        <div className="w-full flex justify-between items-center gap-5">
          <Button
            tooltipMessage={tooltipContent}
            className="w-1/2"
            onClick={() => {
              setVote('yes')
              setShowVoteModal(true)
            }}
            disabled={!canVote}
          >
            <div className="flex flex-row items-center justify-center">
              <ThumbUpIcon className="h-4 w-4 mr-2" />
              Vote Yes
            </div>
          </Button>

          <Button
            tooltipMessage={tooltipContent}
            className="w-1/2"
            onClick={() => {
              setVote('no')
              setShowVoteModal(true)
            }}
            disabled={!canVote}
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
  ) : null
}
