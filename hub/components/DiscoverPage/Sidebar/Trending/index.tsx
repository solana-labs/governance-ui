import SignalStrengthIcon from '@carbon/icons-react/lib/SignalStrength';
import { PublicKey } from '@solana/web3.js';

import { RealmCategory } from '@hub/types/RealmCategory';

import { Org } from './Org';

const CONFIG = [
  {
    name: 'Magic Eden',
    category: RealmCategory.Other,
    logo: 'https://i.imgur.com/DGcchtX.png',
    publicKey: new PublicKey('9MwbgfEkV8ZaeycfciBqytcxwfdYHqD2NYjsTZkH4GxA'),
    url: '/realm/Magic%20Eden',
  },
  {
    name: 'Backpack',
    category: RealmCategory.Web3,
    logo:
      'https://static.ftx.com/nfts/e814aeb2-a599-4697-a199-abf077b8cd5f.jpeg',
    publicKey: new PublicKey('BqLWTZv8xfJiCtu9gm87T1EqtAnL2cCJ1PS9JoKn3oBy'),
    url: '/realm/Backpack',
  },
  {
    name: 'Hubble Protocol',
    category: RealmCategory.Defi,
    logo: 'https://i.imgur.com/B5SNT8F.png',
    publicKey: new PublicKey('AgR2tq1xcbqwmgDcNRaV1BEP5J3kfJfswP5vn6WWe6uC'),
    url: '/realm/Hubble%20Protocol',
  },
  {
    name: 'Dual Finance',
    category: RealmCategory.Defi,
    logo:
      'https://pbs.twimg.com/profile_images/1525300156551274497/FMlM80mn_400x400.jpg',
    publicKey: new PublicKey('HnLuYmBxDxK1MCihHJVFnNudUTpLPc2km6xNcRQ8KPdj'),
    url: '/realm/Dual%20Finance',
  },
  {
    name: 'Metaplex',
    category: RealmCategory.Web3,
    logo: '/realms/metaplex/img/black-circle.png',
    publicKey: new PublicKey('DA5G7QQbFioZ6K33wQcH8fVdgFcnaDjLD7DLQkapZg5X'),
    url: '/realm/Metaplex',
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
