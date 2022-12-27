import type { PublicKey } from '@solana/web3.js';
import React from 'react';

import * as FeedItem from '../FeedItem';
import { FeedItem as FeedItemModel, Page } from '../gql';
import { FeedItemType } from '@hub/types/FeedItemType';
import { ProposalState } from '@hub/types/ProposalState';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  page: Page;
  pinnedFeedItems: FeedItemModel[];
  realm: PublicKey;
  realmUrlId: string;
  userIsAdmin?: boolean;
  onRefresh?(): void;
}

export function Content(props: Props) {
  const pinnedIds = props.pinnedFeedItems.map((feedItem) => feedItem.id);
  const pinnedItems = props.pinnedFeedItems;
  const remainingItems = props.page.edges
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
      {pinnedItems.map((feedItem) => (
        <FeedItem.Content
          className="mb-16"
          key={feedItem.id}
          feedItem={feedItem}
          realm={props.realm}
          realmUrlId={props.realmUrlId}
          userIsAdmin={props.userIsAdmin}
          onDelete={props.onRefresh}
        />
      ))}
      {remainingItems.map((feedItem) => (
        <FeedItem.Content
          className="mb-16"
          key={feedItem.node.id}
          feedItem={feedItem.node}
          realm={props.realm}
          realmUrlId={props.realmUrlId}
          userIsAdmin={props.userIsAdmin}
          onDelete={props.onRefresh}
        />
      ))}
    </div>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div className={props.className}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FeedItem.Loading className="mb-16" key={i} />
      ))}
    </div>
  );
}

export function Error(props: BaseProps) {
  return (
    <div className={props.className}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FeedItem.Error className="mb-16" key={i} />
      ))}
    </div>
  );
}
