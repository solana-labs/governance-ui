import CloseIcon from '@carbon/icons-react/lib/Close';
import FavoriteIcon from '@carbon/icons-react/lib/Favorite';
import FavoriteFilledIcon from '@carbon/icons-react/lib/FavoriteFilled';
import OverflowMenuVerticalIcon from '@carbon/icons-react/lib/OverflowMenuVertical';
import ReplyIcon from '@carbon/icons-react/lib/Reply';
import * as Popover from '@radix-ui/react-popover';
import type { PublicKey } from '@solana/web3.js';

import { useJWT } from '@hub/hooks/useJWT';
import { useMutation } from '@hub/hooks/useMutation';
import { useToast, ToastType } from '@hub/hooks/useToast';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { useUserCreatedFeedItemCommentRepliesStore } from '@hub/stores/userCreatedFeedItemCommentReplies';
import { useUserCreatedTopLevelFeedItemRepliesStore } from '@hub/stores/userCreatedTopLevelFeedItemRepliesStore';
import { FeedItemCommentVoteType } from '@hub/types/FeedItemCommentVoteType';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  className?: string;
  commentId: string;
  realm: PublicKey;
  score: number;
  userIsAdmin?: boolean;
  userVote?: FeedItemCommentVoteType | null;
  onDelete?(): void;
  onReply?(): void;
}

export function Controls(props: Props) {
  const [jwt] = useJWT();
  const [, toggleApproval] = useMutation(
    gql.toggleApprovalResp,
    gql.toggleApproval,
  );
  const [, deleteComment] = useMutation(
    gql.deleteCommentResp,
    gql.deleteComment,
  );
  const { publish } = useToast();
  const updateTopLevelComment = useUserCreatedTopLevelFeedItemRepliesStore(
    (state) => state.updateComment,
  );
  const updateComment = useUserCreatedFeedItemCommentRepliesStore(
    (state) => state.updateComment,
  );

  return (
    <footer className={cx(props.className, 'flex', 'items-center')}>
      <button
        className={cx(
          'flex',
          'items-center',
          'space-x-1.5',
          props.userVote === FeedItemCommentVoteType.Approve
            ? 'text-sky-500'
            : 'text-neutral-500',
          jwt &&
            (props.userVote === FeedItemCommentVoteType.Approve
              ? 'hover:text-sky-400'
              : 'hover:text-sky-500'),
        )}
        disabled={!jwt}
        onClick={(e) => {
          e.stopPropagation();

          if (jwt) {
            toggleApproval({
              commentId: props.commentId,
              realm: props.realm.toBase58(),
            }).then((result) => {
              if (RE.isOk(result) || RE.isStale(result)) {
                if (result.data.voteOnFeedItemComment.parentCommentId) {
                  updateComment(
                    result.data.voteOnFeedItemComment.parentCommentId,
                    result.data.voteOnFeedItemComment,
                  );
                } else {
                  updateTopLevelComment(
                    result.data.voteOnFeedItemComment.feedItemId,
                    result.data.voteOnFeedItemComment,
                  );
                }
              }

              if (RE.isFailed(result)) {
                publish({
                  type: ToastType.Error,
                  title: 'Could not "like" comment',
                  message: result.error.message,
                });
              }
            });
          }
        }}
      >
        {props.userVote === FeedItemCommentVoteType.Approve ? (
          <FavoriteFilledIcon className="h-4 w-4 fill-current transition-colors" />
        ) : (
          <FavoriteIcon className="h-4 w-4 fill-current transition-colors" />
        )}
        <div className="text-xs transition-colors">
          {formatNumber(props.score, undefined, { maximumFractionDigits: 0 })}
        </div>
      </button>
      <button
        className={cx(
          'flex',
          'ml-6',
          'items-center',
          'space-x-1.5',
          'text-neutral-500',
          'hover:text-neutral-900',
          'disabled:cursor-not-allowed',
          'disabled:text-neutral-300',
        )}
        disabled={!jwt}
        onClick={props.onReply}
      >
        <ReplyIcon className="fill-current-500 h-4 w-4 transition-colors" />
        <div className="text-xs transition-colors">Reply</div>
      </button>
      {props.userIsAdmin && (
        <Popover.Root>
          <Popover.Trigger
            className="text-neutral-500 hover:text-neutral-900 px-2 ml-4"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <OverflowMenuVerticalIcon className="h-4 w-4 fill-current transition-colors" />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="drop-shadow-xl overflow-hidden rounded w-40"
              side="top"
              align="start"
              sideOffset={4}
            >
              <button
                className={cx(
                  'bg-white',
                  'gap-x-2',
                  'grid-cols-[16px,1fr]',
                  'grid',
                  'h-10',
                  'items-center',
                  'px-2',
                  'text-left',
                  'text-neutral-500',
                  'tracking-normal',
                  'transition-colors',
                  'w-full',
                  'active:bg-neutral-300',
                  'hover:text-neutral-900',
                  'hover:bg-neutral-200',
                )}
                onClick={(e) => {
                  e.stopPropagation();

                  deleteComment({
                    commentId: props.commentId,
                    realm: props.realm.toBase58(),
                  }).then((result) => {
                    if (RE.isFailed(result)) {
                      publish({
                        type: ToastType.Error,
                        title: 'Could not delete comment',
                        message: result.error.message,
                      });
                    } else {
                      publish({
                        type: ToastType.Success,
                        title: 'Comment deleted!',
                        message: 'The comment has been deleted.',
                      });
                      props.onDelete?.();
                    }
                  });
                }}
              >
                <CloseIcon className="fill-neutral-900 h-4 w-4" />
                <div className="text-xs">Delete this comment</div>
              </button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </footer>
  );
}
