import ListDropdownIcon from '@carbon/icons-react/lib/ListDropdown';
import { useState } from 'react';

import { EndOfFeed } from '@hub/components/Home/Feed/EndOfFeed';
import { useUserPrefs } from '@hub/hooks/useUserPrefs';

import { Controls } from './Controls';
import { Page } from './Page';

interface Props {
  className?: string;
}

export function MyFeed(props: Props) {
  const { getFeedSort, setFeedSort } = useUserPrefs();
  const sort = getFeedSort('my-feed');

  const [additionalPageCursors, setAdditionalPageCursors] = useState<string[]>(
    [],
  );
  const [reachedEndOfFeed, setReachedEndOfFeed] = useState(false);

  return (
    <section className={props.className}>
      <div className="pt-10"></div>
      <div className="max-w-3xl mx-auto py-8 w-full px-4">
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-neutral-900">
            <ListDropdownIcon className="h-5 w-5 fill-current" />
            <div className="font-bold text-xl">My Feed</div>
          </div>
          <Controls
            sort={sort}
            onChangeSort={(sort) => setFeedSort('my-feed', sort)}
          />
        </header>
        <div className="mt-9">
          <Page
            isFirstPage
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
