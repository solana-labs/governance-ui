import * as IT from 'io-ts';
import { gql } from 'urql';

import { feedItemParts, FeedItem } from '../../gql';

export const toggleApproval = gql`
  ${feedItemParts}

  mutation toggleApproval($feedItemId: RealmFeedItemID!, $realm: PublicKey!) {
    voteOnFeedItem(feedItemId: $feedItemId, realm: $realm, vote: Approve) {
      ...FeedItemParts
    }
  }
`;

export const toggleApprovalResp = IT.type({
  voteOnFeedItem: FeedItem,
});
