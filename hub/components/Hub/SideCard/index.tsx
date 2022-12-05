import LightningIcon from '@carbon/icons-react/lib/Lightning';
import * as Tabs from '@radix-ui/react-tabs';
import type { PublicKey } from '@solana/web3.js';

import cx from '@hub/lib/cx';

import { Bounties } from './Bounties';
import { Tab } from './Tab';
import { Trending } from './Trending';

enum Options {
  Bounties = 'Bounties',
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
          className="w-1/2"
          icon={<LightningIcon className="fill-rose-500" />}
          value={Options.Trending}
        >
          Trending Posts
        </Tab>
        <Tab
          className="w-1/2"
          icon={
            <img
              className="rounded-full"
              src="https://superteam.fun/_next/image?url=https%3A%2F%2Fsuper-static-assets.s3.amazonaws.com%2F75e99297-73de-4946-ba6b-0ac603638793%2Fimages%2F259d92ba-12da-42d7-be75-4c9b8b0796dd.png&w=640&q=80"
            />
          }
          value={Options.Bounties}
        >
          Bounties
        </Tab>
      </Tabs.List>
      <Tabs.Content className="px-5 py-4 bg-white" value={Options.Trending}>
        <Trending realm={props.realm} realmUrlId={props.realmUrlId} />
      </Tabs.Content>
      <Tabs.Content className="px-5 py-4 bg-white" value={Options.Bounties}>
        <Bounties realmUrlId={props.realmUrlId} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
