import SignalStrengthIcon from '@carbon/icons-react/lib/SignalStrength';
import { PublicKey } from '@solana/web3.js';

import { RealmCategory } from '@hub/types/RealmCategory';

import { Org } from './Org';

const CONFIG = [
  {
    name: 'Dialect',
    category: RealmCategory.Web3,
    logo: '/realms/Dialect/img/avatar-dialect.png',
    publicKey: new PublicKey('7s5QZmpit4uu1y2bkByXerE2mv3XBHtiNQ4JkDdmKRiQ'),
    url: '/realm/Dialect',
  },
  {
    name: 'Solend',
    category: RealmCategory.Web3,
    logo:
      'https://solend-image-assets.s3.us-east-2.amazonaws.com/1280-circle.png',
    publicKey: new PublicKey('7sf3tcWm58vhtkJMwuw2P3T6UBX7UE5VKxPMnXJUZ1Hn'),
    url: '/realm/SLND',
  },
  {
    name: 'The Imperium of Rain',
    category: RealmCategory.Web3,
    logo: '/realms/RAIN/img/rain_logo.png',
    publicKey: new PublicKey('6orGiJYGXYk9GT2NFoTv2ZMYpA6asMieAqdek4YRH2Dn'),
    url: '/realm/DTP',
  },
  {
    name: 'The Mysterious Death of Lord Harrington',
    category: RealmCategory.Web3,
    logo: '/realms/MDLH/img/MDLH.png',
    publicKey: new PublicKey('6Fiy6ZrCKBfcMieNq3S6qSzfpgRTYKn5zPW78VL9FwjL'),
    url: '/realm/MDLH',
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
