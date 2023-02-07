import { pipe } from 'fp-ts/function';
import React from 'react';

import { Empty } from '../Empty';
import { EnteredViewport } from '@hub/components/Home/Feed/AdditionalPage/EnteredViewport';
import * as FeedItem from '@hub/components/Home/Feed/FeedItem';
import { Loading, Error } from '@hub/components/Home/Feed/InitialPage';
import { LoadingDots } from '@hub/components/LoadingDots';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import { FeedItemSort } from '@hub/types/FeedItemSort';
import { FeedItemType } from '@hub/types/FeedItemType';
import { ProposalState } from '@hub/types/ProposalState';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  className?: string;
  afterCursor?: string;
  isFirstPage?: boolean;
  sort: FeedItemSort;
  onLoadMore?(after: string): void;
  onNoAdditionalPages?(): void;
}

export function Page(props: Props) {
  const [result] = useQuery(gql.getFeedResp, {
    query: props.afterCursor ? gql.getAdditionalPage : gql.getFeed,
    variables: {
      sort: props.sort,
      after: props.afterCursor,
    },
  });

  return pipe(
    result,
    RE.match(
      () => <Error className={props.className} />,
      () => <Loading className={props.className} />,
      ({ followedRealmsFeed }, isStale) => {
        const feedItems = followedRealmsFeed.edges.filter((feedItem) => {
          if (feedItem.node.type === FeedItemType.Proposal) {
            if (
              feedItem.node.proposal.state === ProposalState.Cancelled ||
              feedItem.node.proposal.state === ProposalState.Draft
            ) {
              return false;
            }
          }

          return true;
        });

        return (
          <div className={props.className}>
            {props.isFirstPage && (
              <div
                className={cx(
                  'flex',
                  'items-center',
                  'justify-center',
                  'overflow-hidden',
                  'text-xs',
                  'text-neutral-500',
                  'transition-all',
                  'w-full',
                  isStale ? 'pt-8 mb-6' : 'pt-0 mb-0',
                )}
              >
                {isStale && (
                  <div className="flex items-center">
                    <div className="mr-2">Refreshing the feed</div>
                    <LoadingDots style="pulse" />
                  </div>
                )}
              </div>
            )}
            {props.isFirstPage && !feedItems.length && (
              <Empty className="pt-16" />
            )}
            <EnteredViewport
              onEnteredViewport={() => {
                if (followedRealmsFeed.pageInfo.endCursor) {
                  props.onLoadMore?.(followedRealmsFeed.pageInfo.endCursor);
                } else if (feedItems.length) {
                  props.onNoAdditionalPages?.();
                }
              }}
            />
            {feedItems.map((feedItem) => {
              const realmUrlId =
                feedItem.node.realm.symbol ||
                feedItem.node.realmPublicKey.toBase58();

              return (
                <FeedItem.Content
                  className="mb-16"
                  key={feedItem.node.id}
                  feedItem={feedItem.node}
                  realm={feedItem.node.realmPublicKey}
                  realmInfo={feedItem.node.realm}
                  realmUrlId={realmUrlId}
                />
              );
            })}
          </div>
        );
      },
    ),
  );
}
