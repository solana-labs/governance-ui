import type { PublicKey } from '@solana/web3.js';

import { FeedItemComment } from '../gql';
import cx from '@hub/lib/cx';
import { filterUniqueBy } from '@hub/lib/filterUniqueBy';
import { useUserCreatedTopLevelFeedItemRepliesStore } from '@hub/stores/userCreatedTopLevelFeedItemRepliesStore';

import * as Comment from './Comment';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  comments: FeedItemComment[];
  feedItemId: string;
  realm: PublicKey;
  realmUrlId: string;
  showClientSideComments?: boolean;
}

export function Content(props: Props) {
  const userCreatedReplies = useUserCreatedTopLevelFeedItemRepliesStore(
    (state) => state.comments[props.feedItemId],
  );

  return (
    <div className={cx(props.className, 'space-y-9')}>
      {userCreatedReplies &&
        !!userCreatedReplies.length &&
        props.showClientSideComments &&
        userCreatedReplies.map((comment) => (
          <Comment.Content
            comment={comment}
            feedItemId={props.feedItemId}
            key={comment.id}
            realm={props.realm}
            realmUrlId={props.realmUrlId}
          />
        ))}
      {props.comments.filter(filterUniqueBy('id')).map((comment) => (
        <Comment.Content
          comment={comment}
          feedItemId={props.feedItemId}
          key={comment.id}
          realm={props.realm}
          realmUrlId={props.realmUrlId}
        />
      ))}
    </div>
  );
}

export function Error(props: BaseProps) {
  return (
    <div className={cx(props.className, 'space-y-9')}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Comment.Error key={i} />
      ))}
    </div>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div className={cx(props.className, 'space-y-9')}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Comment.Loading key={i} />
      ))}
    </div>
  );
}
