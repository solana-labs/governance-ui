import * as IT from 'io-ts';

import { FeedItemVoteType as _FeedItemVoteType } from '../FeedItemVoteType';

export const FeedItemVoteTypeApprove = IT.literal(_FeedItemVoteType.Approve);
export const FeedItemVoteTypeDisapprove = IT.literal(
  _FeedItemVoteType.Disapprove,
);

export const FeedItemVoteType = IT.union([
  FeedItemVoteTypeApprove,
  FeedItemVoteTypeDisapprove,
]);
