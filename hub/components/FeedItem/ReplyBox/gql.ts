import * as IT from 'io-ts';
import { gql } from 'urql';

import { feedItemComment, FeedItemComment } from '../gql';
import { PublicKey } from '@hub/types/decoders/PublicKey';

export const getUser = gql`
  query {
    me {
      publicKey
      civicInfo {
        avatarUrl
        handle
        isVerified
      }
      twitterInfo {
        avatarUrl
        handle
      }
    }
  }
`;

export const User = IT.type({
  publicKey: PublicKey,
  civicInfo: IT.union([
    IT.null,
    IT.type({
      avatarUrl: IT.union([IT.null, IT.string]),
      handle: IT.string,
      isVerified: IT.boolean,
    }),
  ]),
  twitterInfo: IT.union([
    IT.null,
    IT.type({
      avatarUrl: IT.union([IT.null, IT.string]),
      handle: IT.string,
    }),
  ]),
});

export type User = IT.TypeOf<typeof User>;

export const getUserResp = IT.type({
  me: User,
});

export const createComment = gql`
  ${feedItemComment}

  mutation createComment(
    $document: RichTextDocument!
    $feedItemId: RealmFeedItemID!
    $parentCommentId: RealmFeedItemCommentID
    $realm: PublicKey!
  ) {
    createFeedItemComment(
      document: $document
      feedItemId: $feedItemId
      parentCommentId: $parentCommentId
      realm: $realm
    ) {
      ...Comment
    }
  }
`;

export const createCommentResp = IT.type({
  createFeedItemComment: FeedItemComment,
});
