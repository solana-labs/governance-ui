import { offlineExchange, StorageAdapter } from '@urql/exchange-graphcache';
import { IntrospectionData } from '@urql/exchange-graphcache/dist/types/ast';
import { gql } from 'urql';

import { feedItemComment } from '@hub/components/FeedItem/gql';
import {
  feedItemPostParts,
  feedItemProposalParts,
} from '@hub/components/Home/Feed/gql';
import * as gqlStores from '@hub/lib/gqlCacheStorage';
import { FeedItemCommentVoteType } from '@hub/types/FeedItemCommentVoteType';
import { FeedItemSort } from '@hub/types/FeedItemSort';
import { FeedItemVoteType } from '@hub/types/FeedItemVoteType';

const makeStorage = async (jwt: string | null) => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const store = gqlStores.create(jwt);
  const cache = (await store.getItem<any>('data')) || {};

  const storage: StorageAdapter = {
    writeData(delta) {
      Object.assign(cache, delta);
      return store.setItem('data', cache);
    },
    async readData() {
      const local = (await store.getItem<any>('data')) || null;
      Object.assign(cache, local);
      return cache;
    },
    writeMetadata(data) {
      store.setItem('metadata', data);
    },
    async readMetadata() {
      const metadataJson = (await store.getItem<any>('metadata')) || null;
      return metadataJson;
    },
  };
  return storage;
};

export const graphcache = async (
  jwt: string | null,
  schema?: IntrospectionData,
) => {
  const storage = await makeStorage(jwt);
  return offlineExchange({
    schema,
    storage,
    keys: {
      ClippedRichTextDocument: () => null,
      Realm: (realm) => realm.publicKey as string,
      RealmHub: (hub) => hub.realm as string,
      RealmHubInfo: () => null,
      RealmHubInfoAboutSection: () => null,
      RealmHubInfoDocumentation: () => null,
      RealmHubInfoFaqItem: () => null,
      RealmHubInfoResource: () => null,
      RealmHubInfoRoadmap: () => null,
      RealmHubInfoRoadmapItem: () => null,
      RealmHubInfoTeamMember: () => null,
      RealmHubInfoTokenDetails: (details) => details.mint as string,
      RealmMember: (member) => member.publicKey as string,
      RealmMemberCivicInfo: (info) => info.handle as string,
      RealmMemberTwitterInfo: (info) => info.handle as string,
      RealmPost: (post) => post.id as string,
      RealmProposal: (proposal) => proposal.publicKey as string,
      RealmProposalUserVote: () => null,
      RealmProposalVoteBreakdown: () => null,
      RealmTreasury: (treasury) => treasury.belongsTo as string,
      User: (user) => user.publicKey as string,
    },
    updates: {
      Mutation: {
        createPost(_result, args, cache) {
          for (const sort of Object.values(FeedItemSort)) {
            cache.invalidate(
              {
                __typename: 'Query',
              },
              'feed',
              {
                sort,
                first: 10,
                realm: args.realm,
              },
            );
          }
        },
      },
    },
    optimistic: {
      voteOnFeedItem(args, cache) {
        const postFragment = gql`
          fragment _ on RealmFeedItemPost {
            ${feedItemPostParts}
          }
        `;

        const proposalFragment = gql`
          fragment _ on RealmFeedItemProposal {
            ${feedItemProposalParts}
          }
        `;

        const currentPost = cache.readFragment(postFragment, {
          id: args.feedItemId,
        });

        const currentProposal = cache.readFragment(proposalFragment, {
          id: args.feedItemId,
        });

        const feedItem = currentPost || currentProposal;

        if (feedItem) {
          let newVote: null | FeedItemVoteType = FeedItemVoteType.Approve;
          let score = feedItem.score;

          if (feedItem.myVote === args.vote) {
            newVote = null;

            if (args.vote === FeedItemVoteType.Approve) {
              score -= 1;
            } else {
              score += 1;
            }
          } else {
            newVote = args.vote as FeedItemVoteType;

            if (!feedItem.myVote) {
              if (args.vote === FeedItemVoteType.Approve) {
                score += 1;
              } else {
                score -= 1;
              }
            } else {
              if (feedItem.myVote === FeedItemVoteType.Approve) {
                score -= 2;
              } else {
                score += 2;
              }
            }
          }

          if (currentPost) {
            return {
              __typename: 'RealmFeedItemPost',
              ...currentPost,
              id: args.feedItemId,
              myVote: newVote,
              score: score,
            };
          }

          if (currentProposal) {
            return {
              __typename: 'RealmFeedItemProposal',
              ...currentProposal,
              id: args.feedItemId,
              myVote: newVote,
              score: score,
            };
          }
        }

        return null;
      },
      voteOnFeedItemComment(args, cache) {
        const commentFragment = gql`
          ${feedItemComment}
        `;

        const comment = cache.readFragment(commentFragment, {
          id: args.commentId,
        });

        if (comment) {
          let newVote: null | FeedItemCommentVoteType =
            FeedItemCommentVoteType.Approve;
          let score = comment.score;

          if (comment.myVote === args.vote) {
            newVote = null;

            if (args.vote === FeedItemCommentVoteType.Approve) {
              score -= 1;
            } else {
              score += 1;
            }
          } else {
            newVote = args.vote as FeedItemCommentVoteType;

            if (!comment.myVote) {
              if (args.vote === FeedItemCommentVoteType.Approve) {
                score += 1;
              } else {
                score -= 1;
              }
            } else {
              if (args.vote === FeedItemCommentVoteType.Approve) {
                score += 2;
              } else {
                score -= 2;
              }
            }
          }

          return {
            __typename: 'RealmFeedItemComment',
            ...comment,
            id: args.commentId,
            myVote: newVote,
            score: score,
          };
        }

        return null;
      },
    },
  });
};
