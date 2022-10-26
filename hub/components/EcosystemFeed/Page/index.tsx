import * as Separator from '@radix-ui/react-separator';
import { pipe } from 'fp-ts/function';
import React from 'react';

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
      ({ ecosystemFeed }, isStale) => {
        const feedItems = ecosystemFeed.edges.filter((feedItem) => {
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
            <EnteredViewport
              onEnteredViewport={() => {
                if (ecosystemFeed.pageInfo.endCursor) {
                  props.onLoadMore?.(ecosystemFeed.pageInfo.endCursor);
                } else {
                  props.onNoAdditionalPages?.();
                }
              }}
            />
            {feedItems.map((feedItem) => {
              const realmUrlId =
                feedItem.node.realm.symbol ||
                feedItem.node.realmPublicKey.toBase58();

              return (
                <React.Fragment key={feedItem.node.id}>
                  <FeedItem.Content
                    feedItem={feedItem.node}
                    realm={feedItem.node.realmPublicKey}
                    realmInfo={feedItem.node.realm}
                    realmUrlId={realmUrlId}
                  />
                  <Separator.Root className="w-full h-[1px] bg-neutral-300 my-4" />
                </React.Fragment>
              );
            })}
          </div>
        );
      },
    ),
  );
}
