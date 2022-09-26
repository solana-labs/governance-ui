import * as Separator from '@radix-ui/react-separator';
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
        <React.Fragment key={feedItem.id}>
          <FeedItem.Content
            feedItem={feedItem}
            realm={props.realm}
            realmUrlId={props.realmUrlId}
          />
          <Separator.Root className="w-full h-[1px] bg-neutral-300 my-4" />
        </React.Fragment>
      ))}
      {remainingItems.map((feedItem) => (
        <React.Fragment key={feedItem.node.id}>
          <FeedItem.Content
            feedItem={feedItem.node}
            realm={props.realm}
            realmUrlId={props.realmUrlId}
          />
          <Separator.Root className="w-full h-[1px] bg-neutral-300 my-4" />
        </React.Fragment>
      ))}
    </div>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div className={props.className}>
      {Array.from({ length: 5 }).map((_, i) => (
        <React.Fragment key={i}>
          <FeedItem.Loading />
          {i < 4 && (
            <Separator.Root className="w-full h-[1px] bg-neutral-300 my-4" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Error(props: BaseProps) {
  return (
    <div className={props.className}>
      {Array.from({ length: 5 }).map((_, i) => (
        <React.Fragment key={i}>
          <FeedItem.Error />
          {i < 4 && (
            <Separator.Root className="w-full h-[1px] bg-neutral-300 my-4" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
