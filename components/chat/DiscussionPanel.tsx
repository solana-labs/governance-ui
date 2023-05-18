import DiscussionForm from './DiscussionForm'
import Comment from './Comment'
import useWalletStore from '../../stores/useWalletStore'
import { useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import {
  GOVERNANCE_CHAT_PROGRAM_ID,
  getGovernanceChatMessages,
} from '@solana/spl-governance'

export const useChatMessagesByProposalQuery = (proposalPk?: PublicKey) => {
  const connection = useWalletStore((s) => s.connection)

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
  const { data: chatMessages } = useChatMessagesByProposalQuery()

  const { voteRecordsByVoter } = useWalletStore((s) => s.selectedProposal)

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
      {chatMessages
        ?.sort(
          (m1, m2) =>
            m2.account.postedAt.toNumber() - m1.account.postedAt.toNumber()
        )
        .map((cm) => (
          <Comment
            chatMessage={cm.account}
            voteRecord={
              voteRecordsByVoter[cm.account.author.toBase58()]?.account
            }
            key={cm.pubkey.toBase58()}
          />
        ))}
    </div>
  )
}

export default DiscussionPanel
