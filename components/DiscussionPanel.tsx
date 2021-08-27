import DiscussionForm from './DiscussionForm'
import Comment from './Comment'
import useWalletStore from '../stores/useWalletStore'

const DiscussionPanel = () => {
  const { chatMessages, voteRecordsByVoter } = useWalletStore(
    (s) => s.selectedProposal
  )

  return (
    <div className="bg-bkg-2 p-6 rounded-md">
      <h2 className="mb-4">
        Discussion{' '}
        <span className="text-base text-fgd-3">
          ({Object.keys(chatMessages).length})
        </span>
      </h2>
      <div className="pb-4">
        <DiscussionForm />
      </div>
      {Object.entries(chatMessages).map(([pk, cm]) => (
        <Comment
          chatMessage={cm.info}
          voteRecord={voteRecordsByVoter[cm.info.author.toBase58()]?.info}
          key={pk}
        />
      ))}
    </div>
  )
}

export default DiscussionPanel
