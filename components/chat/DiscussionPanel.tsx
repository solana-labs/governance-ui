import { useMemo } from 'react'
import DiscussionForm from './DiscussionForm'
import Comment from './Comment'
import { useQuery } from '@tanstack/react-query'
import {
  GOVERNANCE_CHAT_PROGRAM_ID,
  getGovernanceChatMessages,
} from '@solana/spl-governance'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { useSelectedProposalPk } from '@hooks/queries/proposal'

export const useChatMessagesQuery = () => {
  const connection = useLegacyConnectionContext()
  const proposalPk = useSelectedProposalPk()

  const enabled = proposalPk !== undefined
  const query = useQuery({
    queryKey: enabled
      ? [connection.cluster, 'ChatMessages', 'by Proposal', proposalPk]
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return getGovernanceChatMessages(
        connection.current,
        GOVERNANCE_CHAT_PROGRAM_ID,
        proposalPk
      )
    },
    enabled,
  })

  return query
}

const DiscussionPanel = () => {
  const { data: chatMessages } = useChatMessagesQuery()

  const sortedMessages = useMemo(
    () =>
      chatMessages?.sort(
        (m1, m2) =>
          m2.account.postedAt.toNumber() - m1.account.postedAt.toNumber()
      ),
    [chatMessages]
  )

  return (
    <div className="border border-fgd-4 p-4 md:p-6 rounded-lg">
      <h2 className="mb-4">
        Discussion{' '}
        {chatMessages !== undefined && (
          <span className="text-base text-fgd-3">({chatMessages.length})</span>
        )}
      </h2>
      <div className="pb-4">
        <DiscussionForm />
      </div>

      {sortedMessages?.map((cm) => (
        <Comment key={cm.pubkey.toBase58()} chatMessage={cm.account} />
      ))}
    </div>
  )
}

export default DiscussionPanel
