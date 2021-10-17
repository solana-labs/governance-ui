import DiscussionForm from './DiscussionForm'
import Comment from './Comment'
import useWalletStore from '../stores/useWalletStore'

const DiscussionPanel = () => {
  const { chatMessages, voteRecordsByVoter } = useWalletStore(
    (s) => s.selectedProposal
  )

  return (
    <div className="border border-fgd-4 p-4 md:p-6 rounded-lg">
      <h2 className="mb-4">
        Discussion{' '}
        <span className="text-base text-fgd-3">
          ({Object.keys(chatMessages).length})
        </span>
      </h2>
      <div className="pb-4">
        <DiscussionForm />
      </div>
      {Object.values(chatMessages)
        .sort(
          (m1, m2) => m2.info.postedAt.toNumber() - m1.info.postedAt.toNumber()
        )
        .map((cm) => (
          <Comment
            chatMessage={cm.info}
            voteRecord={voteRecordsByVoter[cm.info.author.toBase58()]?.info}
            key={cm.pubkey.toBase58()}
          />
        ))}
    </div>
  )
}

export default DiscussionPanel
