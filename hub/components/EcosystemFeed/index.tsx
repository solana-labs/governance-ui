import ListDropdownIcon from '@carbon/icons-react/lib/ListDropdown';
import { pipe } from 'fp-ts/function';
import { useEffect, useState } from 'react';

import { EcosystemHeader } from '@hub/components/EcosystemHeader';
import * as Controls from '@hub/components/Home/Feed/Controls';
import { EndOfFeed } from '@hub/components/Home/Feed/EndOfFeed';
import { LoadingDots } from '@hub/components/LoadingDots';
import { useQuery } from '@hub/hooks/useQuery';
import { useUserPrefs } from '@hub/hooks/useUserPrefs';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import { FeedItemSort } from '@hub/types/FeedItemSort';
import * as RE from '@hub/types/Result';

import { Page } from './Page';

interface Props {
  className?: string;
}

export function EcosystemFeed(props: Props) {
  const { getFeedSort, setFeedSort } = useUserPrefs();
  const sort = getFeedSort(ECOSYSTEM_PAGE.toBase58());

  const [additionalPageCursors, setAdditionalPageCursors] = useState<string[]>(
    [],
  );
  const [reachedEndOfFeed, setReachedEndOfFeed] = useState(false);

  return (
    <section className={props.className}>
      <EcosystemHeader />
      <div className="max-w-3xl mx-auto py-8 w-full">
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-neutral-900">
            <ListDropdownIcon className="h-5 w-5 fill-current" />
            <div className="font-bold text-xl">Feed</div>
          </div>
          <Controls.Content
            realm={ECOSYSTEM_PAGE}
            realmIconUrl={null}
            realmName="Ecosystem"
            realmUrlId="ecosystem"
            sort={sort}
            onChangeSort={(sort) =>
              setFeedSort(ECOSYSTEM_PAGE.toBase58(), sort)
            }
          />
        </header>
        <div className="mt-9">
          <Page
            sort={sort}
            onLoadMore={(cursor) =>
              setAdditionalPageCursors((cursors) => cursors.concat(cursor))
            }
            onNoAdditionalPages={() => setReachedEndOfFeed(true)}
          />
          {additionalPageCursors.map((cursor) => (
            <Page
              afterCursor={cursor}
              key={cursor}
              sort={sort}
              onLoadMore={(cursor) =>
                setAdditionalPageCursors((cursors) => cursors.concat(cursor))
              }
              onNoAdditionalPages={() => setReachedEndOfFeed(true)}
            />
          ))}
          {reachedEndOfFeed && <EndOfFeed className="py-16" />}
        </div>
      </div>
    </section>
  );
}
