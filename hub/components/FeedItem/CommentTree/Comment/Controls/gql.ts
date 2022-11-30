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

export const deleteComment = gql`
  mutation($commentId: RealmFeedItemCommentID!, $realm: PublicKey!) {
    deleteComment(commentId: $commentId, realm: $realm)
  }
`;

export const toggleApprovalResp = IT.type({
  voteOnFeedItemComment: FeedItemComment,
});

export const deleteCommentResp = IT.type({
  deleteComment: IT.boolean,
});
