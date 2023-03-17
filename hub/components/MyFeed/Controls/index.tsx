import * as Toolbar from '@radix-ui/react-toolbar';

import { Select } from '@hub/components/controls/Select';
import cx from '@hub/lib/cx';
import { FeedItemSort } from '@hub/types/FeedItemSort';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  sort: FeedItemSort;
  onChangeSort?(sort: FeedItemSort): void;
}

export function Controls(props: Props) {
  return (
    <Toolbar.Root
      className={cx(props.className, 'flex', 'items-center', 'space-x-2')}
    >
      <Toolbar.Button asChild>
        <Select
          dropdownClassName="drop-shadow-xl z-30"
          choices={[
            {
              key: FeedItemSort.Relevance,
              label: 'Relevant',
              value: FeedItemSort.Relevance,
            },
            {
              key: FeedItemSort.New,
              label: 'Latest',
              value: FeedItemSort.New,
            },
            {
              key: FeedItemSort.TopAllTime,
              label: 'Top',
              value: FeedItemSort.TopAllTime,
            },
          ]}
          selected={props.sort}
          onChange={(choice) => props.onChangeSort?.(choice.value)}
        />
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
