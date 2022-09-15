import FavoriteIcon from '@carbon/icons-react/lib/Favorite';
import FavoriteFilledIcon from '@carbon/icons-react/lib/FavoriteFilled';
import ReplyIcon from '@carbon/icons-react/lib/Reply';
import type { PublicKey } from '@solana/web3.js';

import { useJWT } from '@hub/hooks/useJWT';
import { useMutation } from '@hub/hooks/useMutation';
import { useToast, ToastType } from '@hub/hooks/useToast';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { FeedItemCommentVoteType } from '@hub/types/FeedItemCommentVoteType';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  className?: string;
  commentId: string;
  realm: PublicKey;
  score: number;
  userVote?: FeedItemCommentVoteType | null;
}

export function Controls(props: Props) {
  const [jwt] = useJWT();
  const [, toggleApproval] = useMutation(
    gql.toggleApprovalResp,
    gql.toggleApproval,
  );
  const { publish } = useToast();

  return (
    <footer
      className={cx(props.className, 'flex', 'items-center', 'space-x-6')}
    >
      <button
        className={cx(
          'flex',
          'items-center',
          'space-x-1.5',
          props.userVote === FeedItemCommentVoteType.Approve
            ? 'text-cyan-500'
            : 'text-neutral-500',
          props.userVote === FeedItemCommentVoteType.Approve && jwt
            ? 'hover:text-cyan-400'
            : 'hover:text-cyan-500',
        )}
        onClick={(e) => {
          e.stopPropagation();

          if (jwt) {
            toggleApproval({
              commentId: props.commentId,
              realm: props.realm.toBase58(),
            }).then((result) => {
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
      <button className="flex items-center space-x-1.5 text-neutral-500 hover:text-cyan-500">
        <ReplyIcon className="fill-current-500 h-4 w-4 transition-colors" />
        <div className="text-xs transition-colors">Reply</div>
      </button>
    </footer>
  );
}
