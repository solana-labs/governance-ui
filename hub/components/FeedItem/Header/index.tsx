import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';

import { FeedItemAuthor } from '../../Home/Feed/gql';
import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

const EDIT_GRACE_PERIOD = 3; // minutes

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  author?: FeedItemAuthor | null;
  created: number;
  updated: number;
}

export function Content(props: Props) {
  const author = props.author;

  const authorName = author
    ? author.twitterInfo?.handle || abbreviateAddress(author.publicKey)
    : 'unknown author';

  const isEdited =
    differenceInMinutes(props.updated, props.created) > EDIT_GRACE_PERIOD;

  return (
    <header className={cx(props.className, 'flex', 'items-center')}>
      <AuthorAvatar author={author} className="h-8 w-8 text-sm" />
      <div className="ml-3 text-sm text-zinc-800">{authorName}</div>
      <div className="ml-2 text-xs text-zinc-500">
        {formatDistanceToNowStrict(props.created)} ago
        {isEdited ? ' *' : ''}
      </div>
    </header>
  );
}

export function Error(props: BaseProps) {
  return (
    <div className={cx(props.className, 'flex', 'items-center')}>
      <div className="rounded-full h-8 w-8 bg-neutral-200" />
      <div className="bg-neutral-200 ml-3 rounded text-sm text-zinc-800 w-24">
        &nbsp;
      </div>
      <div className="bg-neutral-200 ml-2 rounded text-xs text-zinc-500 w-24">
        &nbsp;
      </div>
    </div>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div className={cx(props.className, 'flex', 'items-center')}>
      <div className="rounded-full h-8 w-8 bg-neutral-200 animate-pulse" />
      <div className="bg-neutral-200 ml-3 rounded text-sm text-zinc-800 w-24 animate-pulse">
        &nbsp;
      </div>
      <div className="bg-neutral-200 ml-2 rounded text-xs text-zinc-500 w-24 animate-pulse">
        &nbsp;
      </div>
    </div>
  );
}
