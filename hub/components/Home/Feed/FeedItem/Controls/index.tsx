import FavoriteIcon from '@carbon/icons-react/lib/Favorite';
import FavoriteFilledIcon from '@carbon/icons-react/lib/FavoriteFilled';
import type { PublicKey } from '@solana/web3.js';
import type { BigNumber } from 'bignumber.js';

import { useJWT } from '@hub/hooks/useJWT';
import { useMutation } from '@hub/hooks/useMutation';
import { useToast, ToastType } from '@hub/hooks/useToast';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { ntext } from '@hub/lib/ntext';
import { FeedItemVoteType } from '@hub/types/FeedItemVoteType';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  className?: string;
  feedItemId: string;
  realm: PublicKey;
  score: number;
  totalProposalVotes?: BigNumber | null;
  userVote?: FeedItemVoteType | null;
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
      className={cx(props.className, 'flex', 'items-center', 'justify-between')}
    >
      <button
        className={cx(
          'flex',
          'items-center',
          'space-x-1.5',
          props.userVote === FeedItemVoteType.Approve
            ? 'text-cyan-500'
            : 'text-neutral-500',
          props.userVote === FeedItemVoteType.Approve
            ? 'hover:text-cyan-400'
            : 'hover:text-cyan-500',
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
                  title: 'Could not submit vote',
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
