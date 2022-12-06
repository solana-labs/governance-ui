import SignalStrengthIcon from '@carbon/icons-react/lib/SignalStrength';
import { PublicKey } from '@solana/web3.js';

import { RealmCategory } from '@hub/types/RealmCategory';

import { Org } from './Org';

const CONFIG = [
  {
    name: 'Backpack',
    category: RealmCategory.Web3,
    logo: 'https://i.imgur.com/hdOFyqW.jpg',
    publicKey: new PublicKey('BqLWTZv8xfJiCtu9gm87T1EqtAnL2cCJ1PS9JoKn3oBy'),
    url: '/realm/Backpack',
  },
  {
    name: 'Solana Spaces',
    category: RealmCategory.Other,
    logo: 'https://i.imgur.com/PSk30Rp.jpg',
    publicKey: new PublicKey('58axqgJSAEK3adKL5hx5dYoRqkYMEiEXQZqk9FFFpa7f'),
    url: '/realm/Solana%20Spaces',
  },
  {
    name: 'GenesysGo',
    category: RealmCategory.Web3,
    logo: 'https://i.imgur.com/topNFE2.jpg',
    publicKey: new PublicKey('96VSxgcsxhh8qcFXdT7nMzxA1CMrUBxrxcetqYFqdV5V'),
    url: '/realm/GenesysGo',
  },
  {
    name: 'Superteam',
    category: RealmCategory.Other,
    logo:
      'https://superteam.fun/_next/image?url=https%3A%2F%2Fsuper-static-assets.s3.amazonaws.com%2F75e99297-73de-4946-ba6b-0ac603638793%2Fimages%2F259d92ba-12da-42d7-be75-4c9b8b0796dd.png&w=3840&q=80',
    publicKey: new PublicKey('5NNv1oJ4PFhE2416kTNDzrR9axoHjBTw2CNABqcYpXXL'),
    url: '/realm/Superteam',
  },
  {
    name: 'Rye',
    category: RealmCategory.Web3,
    logo:
      'https://pbs.twimg.com/profile_images/1571859763121758208/32YgNnii_400x400.png',
    publicKey: new PublicKey('7KsnMMyrF8wsxsLZNBZ8hRkGe13MdjAT9ko1qDEvkEWQ'),
    url: '/realm/Rye',
  },
];

interface Props {
  className?: string;
}

export function Trending(props: Props) {
  return (
    <article className={props.className}>
      <header className="flex items-center space-x-2.5">
        <SignalStrengthIcon className="h-4 w-4 fill-neutral-500" />
        <div className="text-sm font-semibold text-neutral-900 uppercase">
          trending orgs
        </div>
      </header>
      <div className="mt-6 space-y-5">
        {CONFIG.map((item) => (
          <Org {...item} className="px-2" key={item.publicKey.toBase58()} />
        ))}
      </div>
    </article>
  );
}
