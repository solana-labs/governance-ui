import DiscussionForm from './DiscussionForm'
import Comment from './Comment'

const comments = [
  {
    author: '@twitter_handle',
    avatarUrl: 'https://i.pravatar.cc/400',
    content:
      'Cheese slices caerphilly brie. Cream cheese swiss port-salut fromage stinking bishop rubber cheese rubber cheese the big cheese.',
    stake: 12345,
    timestamp: 1629979800,
    vote: 'Approve',
  },
  {
    author: '@twitter_handle',
    avatarUrl: '',
    content:
      'Everyone loves monterey jack fromage. Stilton everyone loves melted cheese cauliflower cheese feta who moved my cheese roquefort airedale.',
    stake: 654321,
    timestamp: 1629959800,
    vote: 'Deny',
  },
]

const DiscussionPanel = () => {
  return (
    <div className="bg-bkg-2 p-6 rounded-md">
      <h2 className="mb-4">
        Discussion{' '}
        <span className="text-base text-fgd-3">({comments.length})</span>
      </h2>
      <div className="pb-4">
        <DiscussionForm />
      </div>
      {comments.map((c) => (
        <Comment comment={c} key={c.timestamp} />
      ))}
    </div>
  )
}

export default DiscussionPanel
