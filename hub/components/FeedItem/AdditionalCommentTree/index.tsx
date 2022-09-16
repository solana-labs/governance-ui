import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';

import * as CommentTree from '../CommentTree';
import * as gql from '../gql';
import { EnteredViewport } from '@hub/components/Home/Feed/AdditionalPage/EnteredViewport';
import { useQuery } from '@hub/hooks/useQuery';
import * as RE from '@hub/types/Result';

interface Props {
  className?: string;
  feedItemId: string;
  cursor: string;
  realm: PublicKey;
  realmUrlId: string;
  onLoadMore?(cursor: string): void;
}

export function AdditionalCommentTree(props: Props) {
  const [commentsResult] = useQuery(gql.getCommentsResp, {
    query: gql.getMoreComments,
    variables: { after: props.cursor, feedItemId: props.feedItemId },
  });

  return pipe(
    commentsResult,
    RE.match(
      () => (
        <div className={props.className}>
          <CommentTree.Error />
        </div>
      ),
      () => (
        <div className={props.className}>
          <CommentTree.Loading />
        </div>
      ),
      ({ feedItemCommentTree }) => (
        <div className={props.className}>
          <EnteredViewport
            onEnteredViewport={() => {
              if (feedItemCommentTree.pageInfo.endCursor) {
                props.onLoadMore?.(feedItemCommentTree.pageInfo.endCursor);
              }
            }}
          />
          <CommentTree.Content
            comments={feedItemCommentTree.edges.map((edge) => edge.node)}
            feedItemId={props.feedItemId}
            realm={props.realm}
            realmUrlId={props.realmUrlId}
          />
        </div>
      ),
    ),
  );
}
