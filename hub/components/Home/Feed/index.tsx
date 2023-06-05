import ListDropdownIcon from '@carbon/icons-react/lib/ListDropdown';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';
import { useEffect, useState } from 'react';

import { LoadingDots } from '@hub/components/LoadingDots';
import { useQuery } from '@hub/hooks/useQuery';
import { useUserPrefs } from '@hub/hooks/useUserPrefs';
import cx from '@hub/lib/cx';
import { FeedItemSort } from '@hub/types/FeedItemSort';
import * as RE from '@hub/types/Result';

import { AdditionalPage } from './AdditionalPage';
import * as Controls from './Controls';
import { Empty } from './Empty';
import { EndOfFeed } from './EndOfFeed';
import { getFeed, getFeedResp } from './gql';
import * as InitialPage from './InitialPage';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  realm: PublicKey;
  realmIconUrl?: string | null;
  realmName: string;
  realmUrlId: string;
  userIsAdmin?: boolean;
}

export function Content(props: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { getFeedSort, setFeedSort } = useUserPrefs();

  const sort = getFeedSort(props.realmUrlId);

  const [result, refresh] = useQuery(getFeedResp, {
    query: getFeed,
    variables: {
      sort,
      realm: props.realm.toBase58(),
    },
  });
  const [additionalPageCursors, setAdditionalPageCursors] = useState<string[]>(
    [],
  );
  const [reachedEndOfFeed, setReachedEndOfFeed] = useState(false);

  const firstPageEndCursor = RE.isOk(result)
    ? result.data.feed.pageInfo.endCursor
    : null;

  useEffect(() => {
    if (firstPageEndCursor) {
      setAdditionalPageCursors([firstPageEndCursor]);
    }
  }, [firstPageEndCursor]);

  useEffect(() => {
    if (!firstPageEndCursor && RE.isOk(result)) {
      setReachedEndOfFeed(true);
    }
  }, [firstPageEndCursor, RE.isOk(result)]);

  useEffect(() => {
    setReachedEndOfFeed(false);
    setAdditionalPageCursors([]);
  }, [refreshKey]);

  return (
    <section className={props.className} key={String(refreshKey)}>
      <header className="flex items-center justify-between py-6 border-b border-neutral-300">
        <div className="flex items-center space-x-3 text-neutral-900">
          <ListDropdownIcon className="h-5 w-5 fill-current" />
          <div className="font-bold text-xl">Feed</div>
        </div>
        <Controls.Content
          realm={props.realm}
          realmIconUrl={props.realmIconUrl}
          realmName={props.realmName}
          realmUrlId={props.realmUrlId}
          sort={sort}
          onChangeSort={(sort) => setFeedSort(props.realmUrlId, sort)}
        />
      </header>
      {pipe(
        result,
        RE.match(
          () => <InitialPage.Error className="mt-9" />,
          () => <InitialPage.Loading className="mt-9" />,
          ({ feed, pinnedFeedItems }, isStale) => (
            <div>
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
              {feed.edges.length ? (
                <InitialPage.Content
                  className="mt-9"
                  page={feed}
                  pinnedFeedItems={
                    sort === FeedItemSort.Relevance ? pinnedFeedItems : []
                  }
                  realm={props.realm}
                  realmUrlId={props.realmUrlId}
                  userIsAdmin={props.userIsAdmin}
                  onRefresh={() => {
                    refresh({ requestPolicy: 'network-only' });
                    setRefreshKey((key) => key + 1);
                  }}
                />
              ) : (
                <Empty className="mt-24" />
              )}
              {additionalPageCursors.map((cursor) => (
                <AdditionalPage
                  key={cursor}
                  cursor={cursor}
                  pinnedFeedItems={
                    sort === FeedItemSort.Relevance ? pinnedFeedItems : []
                  }
                  sort={sort}
                  realm={props.realm}
                  realmUrlId={props.realmUrlId}
                  userIsAdmin={props.userIsAdmin}
                  onLoadMore={(after) =>
                    setAdditionalPageCursors((cursors) => cursors.concat(after))
                  }
                  onNoAdditionalPages={() => setReachedEndOfFeed(true)}
                  onRefresh={() => {
                    refresh({ requestPolicy: 'network-only' });
                    setRefreshKey((key) => key + 1);
                  }}
                />
              ))}
              {!!feed.edges.length && reachedEndOfFeed && (
                <EndOfFeed className="py-16" />
              )}
            </div>
          ),
        ),
      )}
    </section>
  );
}

export function Loading(props: BaseProps) {
  return (
    <section className={props.className}>
      <header className="flex items-center justify-between">
        <div className="text-neutral-900 text-xl rounded bg-neutral-200 w-20 animate-pulse">
          &nbsp;
        </div>
        <Controls.Loading />
      </header>
    </section>
  );
}

export function Error(props: BaseProps) {
  return (
    <section className={props.className}>
      <header className="flex items-center justify-between">
        <div className="text-neutral-900 text-xl rounded bg-neutral-200 w-20">
          &nbsp;
        </div>
        <Controls.Error />
      </header>
    </section>
  );
}
