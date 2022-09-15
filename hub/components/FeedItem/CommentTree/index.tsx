import type { PublicKey } from '@solana/web3.js';

import { FeedItemComment } from '../gql';
import cx from '@hub/lib/cx';

import { Comment } from './Comment';

interface Props {
  className?: string;
  comments: FeedItemComment[];
  realm: PublicKey;
}

export function Content(props: Props) {
  return (
    <div className={cx(props.className, 'space-y-9')}>
      {props.comments.map((comment) => (
        <Comment comment={comment} key={comment.id} realm={props.realm} />
      ))}
    </div>
  );
}
