import * as IT from 'io-ts';
import { gql } from 'urql';

import { FeedItemClippedDocument } from '@hub/components/Home/Feed/gql';
import { FeedItemVoteType } from '@hub/types/decoders/FeedItemVoteType';
import { ProposalState } from '@hub/types/decoders/ProposalState';

export const getTrending = gql`
  query getTrending($realm: PublicKey!) {
    feed(realm: $realm, first: 6) {
      edges {
        node {
          ... on RealmFeedItemPost {
            updated
            id
            myVote
            score
            title
            clippedDocument(charLimit: 80) {
              document
              isClipped
            }
          }
          ... on RealmFeedItemProposal {
            updated
            id
            myVote
            score
            title
            clippedDocument(charLimit: 80) {
              document
              isClipped
            }
            proposal {
              state
            }
          }
        }
      }
    }
  }
`;

export const getTrendingResp = IT.type({
  feed: IT.type({
    edges: IT.array(
      IT.type({
        node: IT.type({
          updated: IT.number,
          id: IT.string,
          myVote: IT.union([IT.null, FeedItemVoteType]),
          score: IT.number,
          title: IT.string,
          clippedDocument: FeedItemClippedDocument,
          proposal: IT.union([
            IT.undefined,
            IT.null,
            IT.type({
              state: ProposalState,
            }),
          ]),
        }),
      }),
    ),
  }),
});
