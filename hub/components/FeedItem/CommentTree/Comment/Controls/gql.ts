import * as IT from 'io-ts';
import { gql } from 'urql';

import { feedItemComment, FeedItemComment } from '../../../gql';

export const toggleApproval = gql`
  ${feedItemComment}

  mutation toggleApproval(
    $commentId: RealmFeedItemCommentID!
    $realm: PublicKey!
  ) {
    voteOnFeedItemComment(commentId: $commentId, realm: $realm, vote: Approve) {
      ...Comment
    }
  }
`;

export const toggleApprovalResp = IT.type({
  voteOnFeedItemComment: FeedItemComment,
});
