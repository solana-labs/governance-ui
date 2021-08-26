import moment from 'moment'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid'

const Comment = ({ comment }) => {
  const { author, avatarUrl, content, stake, timestamp, vote } = comment
  return (
    <div className="border-b border-bkg-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {avatarUrl ? (
            <img className="h-10 rounded-full w-10" src={avatarUrl} />
          ) : (
            <div className="bg-bkg-3 h-10 rounded-full w-10" />
          )}
          <div className="ml-3">
            <div className="font-bold pb-0.5 text-fgd-1">{author}</div>
            <div className="text-fgd-3 text-xs">
              {moment.unix(timestamp).fromNow()}
            </div>
          </div>
        </div>
        <div className="bg-bkg-3 flex items-center px-4 py-2 rounded-full">
          <div className="flex items-center pr-2 text-fgd-1 text-xs">
            {vote === 'Approve' ? (
              <CheckCircleIcon className="h-5 mr-1 text-green w-5" />
            ) : (
              <XCircleIcon className="h-5 mr-1 text-red w-5" />
            )}
            {vote}
          </div>
          <span className="text-fgd-4">|</span>
          <span className="pl-2 text-xs">{stake.toLocaleString()} MNGO</span>
        </div>
      </div>
      <p>{content}</p>
    </div>
  )
}

export default Comment
