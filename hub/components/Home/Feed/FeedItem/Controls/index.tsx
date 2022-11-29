import ChatIcon from '@carbon/icons-react/lib/Chat';
import CloseIcon from '@carbon/icons-react/lib/Close';
import FavoriteIcon from '@carbon/icons-react/lib/Favorite';
import FavoriteFilledIcon from '@carbon/icons-react/lib/FavoriteFilled';
import OverflowMenuVerticalIcon from '@carbon/icons-react/lib/OverflowMenuVertical';
import * as Popover from '@radix-ui/react-popover';
import type { PublicKey } from '@solana/web3.js';
import type { BigNumber } from 'bignumber.js';

import { useJWT } from '@hub/hooks/useJWT';
import { useMutation } from '@hub/hooks/useMutation';
import { useToast, ToastType } from '@hub/hooks/useToast';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { ntext } from '@hub/lib/ntext';
import { FeedItemType } from '@hub/types/FeedItemType';
import { FeedItemVoteType } from '@hub/types/FeedItemVoteType';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  className?: string;
  feedItemId: string;
  numReplies?: number;
  realm: PublicKey;
  score: number;
  totalProposalVotes?: BigNumber | null;
  type: FeedItemType;
  userIsAdmin?: boolean;
  userVote?: FeedItemVoteType | null;
  onDelete?(): void;
}

export function Controls(props: Props) {
  const [jwt] = useJWT();
  const [, toggleApproval] = useMutation(
    gql.toggleApprovalResp,
    gql.toggleApproval,
  );
  const [, deletePost] = useMutation(gql.deletePostResp, gql.deletePost);
  const { publish } = useToast();

  return (
    <footer
      className={cx(props.className, 'flex', 'items-center', 'justify-between')}
    >
      <div className="flex items-center">
        <button
          className={cx(
            'flex',
            'items-center',
            'space-x-1.5',
            props.userVote === FeedItemVoteType.Approve
              ? 'text-sky-500'
              : 'text-neutral-500',
            props.userVote === FeedItemVoteType.Approve && jwt
              ? 'hover:text-sky-400'
              : 'hover:text-sky-500',
          )}
          onClick={(e) => {
            e.stopPropagation();

            if (jwt) {
              toggleApproval({
                feedItemId: props.feedItemId,
                realm: props.realm.toBase58(),
              }).then((result) => {
                if (RE.isFailed(result)) {
                  publish({
                    type: ToastType.Error,
                    title: 'Could not "like" post',
                    message: result.error.message,
                  });
                }
              });
            }
          }}
        >
          {props.userVote === FeedItemVoteType.Approve ? (
            <FavoriteFilledIcon className="h-4 w-4 fill-current transition-colors" />
          ) : (
            <FavoriteIcon className="h-4 w-4 fill-current transition-colors" />
          )}
          <div className="text-xs transition-colors">
            {formatNumber(props.score, undefined, { maximumFractionDigits: 0 })}
          </div>
        </button>
        {Number.isInteger(props.numReplies) && (
          <div className="flex items-center ml-6 text-neutral-500 hover:text-neutral-900">
            <ChatIcon className="fill-current h-4 w-4 mr-1 transition-colors" />
            <div className="text-xs transition-colors">
              {props.numReplies} {ntext(props.numReplies || 0, 'Comment')}
            </div>
          </div>
        )}
        {props.userIsAdmin && props.type === FeedItemType.Post && (
          <Popover.Root>
            <Popover.Trigger
              className="text-neutral-500 hover:text-neutral-900 ml-4 px-2"
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

                    deletePost({
                      feedItemId: props.feedItemId,
                      realm: props.realm.toBase58(),
                    }).then((result) => {
                      if (RE.isFailed(result)) {
                        publish({
                          type: ToastType.Error,
                          title: 'Could not delete post',
                          message: result.error.message,
                        });
                      } else {
                        props.onDelete?.();
                      }
                    });
                  }}
                >
                  <CloseIcon className="fill-neutral-900 h-4 w-4" />
                  <div className="text-xs">Delete this post</div>
                </button>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )}
      </div>
      <div className="flex items-center">
        {props.totalProposalVotes && (
          <div className="text-xs text-neutral-500">
            {formatNumber(props.totalProposalVotes, undefined, {
              maximumFractionDigits: 0,
            })}{' '}
            {ntext(props.totalProposalVotes.eq(1) ? 1 : 2, 'total vote')}
          </div>
        )}
      </div>
    </footer>
  );
}
