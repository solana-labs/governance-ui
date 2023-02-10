import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';
import React from 'react';

import * as FeedItem from '../FeedItem';
import {
  FeedItem as FeedItemModel,
  Page,
  getAdditionalPage,
  getAdditionalPageResp,
} from '../gql';
import { Loading, Error } from '../InitialPage';
import { useQuery } from '@hub/hooks/useQuery';
import { FeedItemSort } from '@hub/types/FeedItemSort';
import { FeedItemType } from '@hub/types/FeedItemType';
import { ProposalState } from '@hub/types/ProposalState';
import * as RE from '@hub/types/Result';

import { EnteredViewport } from './EnteredViewport';
interface BaseProps {
  className?: string;
  cursor: string;
  pinnedFeedItems: FeedItemModel[];
  sort: FeedItemSort;
  realm: PublicKey;
  realmUrlId: string;
  userIsAdmin?: boolean;
  onLoadMore?(after: string): void;
  onNoAdditionalPages?(): void;
  onRefresh?(): void;
}

interface Props extends BaseProps {
  page: Page;
}

export function Content(props: Props) {
  const pinnedIds = props.pinnedFeedItems.map((feedItem) => feedItem.id);
  const feedItems = props.page.edges
    .filter((feedItem) => !pinnedIds.includes(feedItem.node.id))
    .filter((feedItem) => {
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
      <EnteredViewport
        onEnteredViewport={() => {
          if (props.page.pageInfo.endCursor) {
            props.onLoadMore?.(props.page.pageInfo.endCursor);
          } else {
            props.onNoAdditionalPages?.();
          }
        }}
      />
      {feedItems.map((feedItem) => (
        <FeedItem.Content
          className="mb-16"
          key={feedItem.node.id}
          feedItem={feedItem.node}
          realm={props.realm}
          realmUrlId={props.realmUrlId}
          userIsAdmin={props.userIsAdmin}
        />
      ))}
    </div>
  );
}

export function AdditionalPage(props: BaseProps) {
  const [result] = useQuery(getAdditionalPageResp, {
    query: getAdditionalPage,
    variables: {
      after: props.cursor,
      realm: props.realm.toBase58(),
      sort: props.sort,
    },
  });

  return pipe(
    result,
    RE.match(
      () => <Error className={props.className} />,
      () => <Loading className={props.className} />,
      ({ feed }) => (
        <Content
          className={props.className}
          cursor={props.cursor}
          page={feed}
          pinnedFeedItems={props.pinnedFeedItems}
          sort={props.sort}
          realm={props.realm}
          realmUrlId={props.realmUrlId}
          onLoadMore={props.onLoadMore}
          onNoAdditionalPages={props.onNoAdditionalPages}
          onRefresh={props.onRefresh}
        />
      ),
    ),
  );
}
