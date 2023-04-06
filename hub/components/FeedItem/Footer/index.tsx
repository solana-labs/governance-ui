import type { PublicKey } from '@solana/web3.js';
import type { BigNumber } from 'bignumber.js';

import { Controls } from '@hub/components/Home/Feed/FeedItem/Controls';
import cx from '@hub/lib/cx';
import { FeedItemType } from '@hub/types/FeedItemType';
import { FeedItemVoteType } from '@hub/types/FeedItemVoteType';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  feedItemId: string;
  numReplies?: number;
  realm: PublicKey;
  score: number;
  totalProposalVotes?: BigNumber | null;
  type: FeedItemType;
  userVote?: FeedItemVoteType | null;
  userIsAdmin?: boolean;
  onDelete?(): void;
}

export function Content(props: Props) {
  return <Controls {...props} />;
}

export function Error(props: BaseProps) {
  return (
    <footer
      className={cx(props.className, 'flex', 'items-center', 'justify-between')}
    >
      <div className="h-4 w-32 rounded bg-neutral-200" />
    </footer>
  );
}

export function Loading(props: BaseProps) {
  return (
    <footer
      className={cx(props.className, 'flex', 'items-center', 'justify-between')}
    >
      <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse" />
    </footer>
  );
}
