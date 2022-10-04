import LightningIcon from '@carbon/icons-react/lib/Lightning';
import * as Tabs from '@radix-ui/react-tabs';
import type { PublicKey } from '@solana/web3.js';

import cx from '@hub/lib/cx';

import { Tab } from './Tab';
import { Trending } from './Trending';

enum Options {
  Trending = 'Trending',
}

interface Props {
  className?: string;
  realm: PublicKey;
  realmUrlId: string;
}

export function SideCard(props: Props) {
  return (
    <Tabs.Root
      className={cx('rounded', 'overflow-hidden', props.className)}
      defaultValue={Options.Trending}
    >
      <Tabs.List className="flex items-center">
        <Tab
          className="w-full"
          icon={<LightningIcon className="fill-rose-500" />}
          value={Options.Trending}
        >
          Trending Posts
        </Tab>
      </Tabs.List>
      <Tabs.Content className="p-4 bg-white" value={Options.Trending}>
        <Trending realm={props.realm} realmUrlId={props.realmUrlId} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
