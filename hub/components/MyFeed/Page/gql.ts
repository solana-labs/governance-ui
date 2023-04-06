import * as IT from 'io-ts';
import { gql } from 'urql';

import {
  feedItemPostParts,
  feedItemProposalParts,
  FeedItemAuthor,
  FeedItemClippedDocument,
} from '@hub/components/Home/Feed/gql';
import { BigNumber } from '@hub/types/decoders/BigNumber';
import {
  FeedItemTypePost,
  FeedItemTypeProposal,
} from '@hub/types/decoders/FeedItemType';
import { FeedItemVoteType } from '@hub/types/decoders/FeedItemVoteType';
import { ProposalState } from '@hub/types/decoders/ProposalState';
import { ProposalUserVoteType } from '@hub/types/decoders/ProposalUserVoteType';
import { PublicKey } from '@hub/types/decoders/PublicKey';
import { RichTextDocument } from '@hub/types/decoders/RichTextDocument';

export const feedItemParts = `
  fragment FeedItemParts on RealmFeedItem {
    ... on RealmFeedItemPost {
      ${feedItemPostParts}
    }
    ... on RealmFeedItemProposal {
      ${feedItemProposalParts}
    }
  }
`;

export const getFeed = gql`
  ${feedItemParts}

  query getFeed($sort: RealmFeedItemSort!) {
    followedRealmsFeed(first: 10, sort: $sort) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          ...FeedItemParts
        }
      }
    }
  }
`;

export const getAdditionalPage = gql`
  ${feedItemParts}

  query getFeed($sort: RealmFeedItemSort!, $after: Cursor!) {
    followedRealmsFeed(after: $after, sort: $sort) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          ...FeedItemParts
        }
      }
    }
  }
`;

export const RealmInfo = IT.type({
  iconUrl: IT.union([IT.null, IT.string]),
  name: IT.string,
  symbol: IT.union([IT.null, IT.string]),
  urlId: IT.string,
});

export type RealmInfo = IT.TypeOf<typeof RealmInfo>;

export const FeedItemPost = IT.type({
  type: FeedItemTypePost,
  author: IT.union([IT.null, FeedItemAuthor]),
  clippedDocument: FeedItemClippedDocument,
  created: IT.number,
  document: RichTextDocument,
  id: IT.string,
  myVote: IT.union([IT.null, FeedItemVoteType]),
  numComments: IT.number,
  realmPublicKey: PublicKey,
  realm: RealmInfo,
  score: IT.number,
  title: IT.string,
  updated: IT.number,
});

export type FeedItemPost = IT.TypeOf<typeof FeedItemPost>;

export const FeedItemProposal = IT.type({
  type: FeedItemTypeProposal,
  author: IT.union([IT.null, FeedItemAuthor]),
  clippedDocument: FeedItemClippedDocument,
  created: IT.number,
  document: RichTextDocument,
  id: IT.string,
  myVote: IT.union([IT.null, FeedItemVoteType]),
  numComments: IT.number,
  realmPublicKey: PublicKey,
  realm: RealmInfo,
  score: IT.number,
  title: IT.string,
  updated: IT.number,
  proposal: IT.type({
    publicKey: PublicKey,
    state: ProposalState,
    myVote: IT.union([
      IT.null,
      IT.type({
        type: ProposalUserVoteType,
        weight: BigNumber,
      }),
    ]),
    voteBreakdown: IT.type({
      percentThresholdMet: IT.union([IT.null, IT.number]),
      threshold: IT.union([IT.null, BigNumber]),
      totalNoWeight: BigNumber,
      totalPossibleWeight: IT.union([IT.null, BigNumber]),
      totalYesWeight: BigNumber,
      voteThresholdPercentage: IT.union([IT.null, IT.number]),
      votingEnd: IT.union([IT.null, IT.number]),
    }),
  }),
});
export type FeedItemProposal = IT.TypeOf<typeof FeedItemProposal>;

export const FeedItem = IT.union([FeedItemPost, FeedItemProposal]);

export type FeedItem = IT.TypeOf<typeof FeedItem>;

export const Page = IT.type({
  pageInfo: IT.type({
    endCursor: IT.union([IT.null, IT.string]),
    hasNextPage: IT.boolean,
    hasPreviousPage: IT.boolean,
    startCursor: IT.union([IT.null, IT.string]),
  }),
  edges: IT.array(
    IT.type({
      cursor: IT.string,
      node: FeedItem,
    }),
  ),
});

export type Page = IT.TypeOf<typeof Page>;

export const getFeedResp = IT.type({
  followedRealmsFeed: Page,
});
