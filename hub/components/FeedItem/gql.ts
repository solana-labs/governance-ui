import * as IT from 'io-ts';
import { gql } from 'urql';

import { feedItemParts, FeedItem, FeedItemAuthor } from '../Home/Feed/gql';
import { FeedItemCommentVoteType } from '@hub/types/decoders/FeedItemCommentVoteType';
import { PublicKey } from '@hub/types/decoders/PublicKey';
import { RichTextDocument } from '@hub/types/decoders/RichTextDocument';

export const feedItemComment = `
  fragment Comment on RealmFeedItemComment {
    author {
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
    created
    document
    feedItemId
    id
    myVote
    parentCommentId
    score
    updated
    repliesCount
  }
`;

export const getComments = gql`
  ${feedItemComment}

  query getCommentTree($feedItemId: RealmFeedItemID!) {
    feedItemCommentTree(first: 10, feedItemId: $feedItemId, depth: 6) {
      edges {
        cursor
        node {
          ...Comment
          replies {
            ...Comment
            replies {
              ...Comment
              replies {
                ...Comment
                replies {
                  ...Comment
                  replies {
                    ...Comment
                    replies {
                      ...Comment
                      replies {
                        ...Comment
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const getMoreComments = gql`
  ${feedItemComment}

  query getMoreComments($feedItemId: RealmFeedItemID!, $after: Cursor!) {
    feedItemCommentTree(feedItemId: $feedItemId, depth: 6, after: $after) {
      edges {
        cursor
        node {
          ...Comment
          replies {
            ...Comment
            replies {
              ...Comment
              replies {
                ...Comment
                replies {
                  ...Comment
                  replies {
                    ...Comment
                    replies {
                      ...Comment
                      replies {
                        ...Comment
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export interface FeedItemComment {
  author: null | FeedItemAuthor;
  created: number;
  document: IT.TypeOf<typeof RichTextDocument>;
  feedItemId: string;
  id: string;
  myVote: null | IT.TypeOf<typeof FeedItemCommentVoteType>;
  parentCommentId: null | string;
  score: number;
  updated: number;
  repliesCount: number;
  replies: null | undefined | FeedItemComment[];
}

export const FeedItemComment: IT.Type<FeedItemComment> = IT.recursion(
  'FeedItemComment',
  () =>
    IT.type({
      author: IT.union([IT.null, FeedItemAuthor as any]),
      created: IT.number,
      document: RichTextDocument,
      feedItemId: IT.string,
      id: IT.string,
      myVote: IT.union([IT.null, FeedItemCommentVoteType]),
      parentCommentId: IT.union([IT.null, IT.string]),
      score: IT.number,
      updated: IT.number,
      repliesCount: IT.number,
      replies: IT.union([IT.null, IT.undefined, IT.array(FeedItemComment)]),
    }),
);

export const CommentTreePage = IT.type({
  edges: IT.array(
    IT.type({
      cursor: IT.string,
      node: FeedItemComment,
    }),
  ),
  pageInfo: IT.type({
    hasNextPage: IT.boolean,
    hasPreviousPage: IT.boolean,
    startCursor: IT.union([IT.null, IT.string]),
    endCursor: IT.union([IT.null, IT.string]),
  }),
});

export type CommentTreePage = IT.TypeOf<typeof CommentTreePage>;

export const getCommentsResp = IT.type({
  feedItemCommentTree: CommentTreePage,
});

export const getFeedItem = gql`
  ${feedItemParts}

  query getFeedItem($realm: PublicKey!, $feedItemId: RealmFeedItemID!) {
    feedItem(id: $feedItemId, realm: $realm) {
      ...FeedItemParts
    }
  }
`;

export const getFeedItemResp = IT.type({
  feedItem: FeedItem,
});

export const getRealm = gql`
  query getRealm($realm: PublicKey!) {
    hub(realm: $realm) {
      realm
      info {
        token {
          mint
          price
          symbol
        }
      }
    }
    realm(publicKey: $realm) {
      bannerImageUrl
      iconUrl
      name
      publicKey
      symbol
      twitterHandle
      websiteUrl
    }
  }
`;

export const getRealmResp = IT.type({
  hub: IT.type({
    realm: PublicKey,
    info: IT.type({
      token: IT.union([
        IT.null,
        IT.type({
          mint: PublicKey,
          price: IT.number,
          symbol: IT.string,
        }),
      ]),
    }),
  }),
  realm: IT.type({
    bannerImageUrl: IT.union([IT.null, IT.string]),
    iconUrl: IT.union([IT.null, IT.string]),
    name: IT.string,
    publicKey: PublicKey,
    symbol: IT.union([IT.null, IT.string]),
    twitterHandle: IT.union([IT.null, IT.string]),
    websiteUrl: IT.union([IT.null, IT.string]),
  }),
});
