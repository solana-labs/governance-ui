import GameConsoleIcon from '@carbon/icons-react/lib/GameConsole';
import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';

export const ITEMS = [
  {
    bannerImgSrc:
      'https://i.seadn.io/gae/9qqR3x65Uu5YmBTQ75hqy_NCVoEmkixVHQl7XcvnPF2yeWEiLpbN3B-zf1IlqwxFQh4TGg85wU_EKtbYAG2P_4nAFQTXyJ5QXmu_8A?auto=format&w=2048',
    description:
      'Aurory Project is a AAA studio building the web3 gaming platform of the future.',
    iconImgSrc:
      'https://i.seadn.io/gae/Qzl6u460tNyzWFrlaLQIa2VMBc1HBX5X7IDfEYBbKV3q1p_BDVkqC-A7-DS5RA-IKagzD0m7J-LDpmr_XnY2ocsTcXGM01DXM7lqUg?auto=format&w=2048',
    name: 'Aurory',
    publicKey: new PublicKey('C98yb8FSshG7oH5pCMf41ghg199YjsoUozxQ4VdCpwmM'),
    urlId: 'Aurory',
  },
  {
    bannerImgSrc: '/realms/RCH/banner.png',
    description:
      'The standard for enabling modern communities to share ideas, make decisions, and collectively manage treasuries.',
    iconImgSrc: '/realms/RCH/icon.png',
    name: 'Realms Community Hub',
    publicKey: new PublicKey('9efHuf3HAKiMDWNhgJyZW1Zyo8P7rRhAMXoJa9vpRo1e'),
    urlId: 'RCH',
  },
  {
    bannerImgSrc: '/realms/RCH/banner.png',
    description:
      'The standard for enabling modern communities to share ideas, make decisions, and collectively manage treasuries.',
    iconImgSrc: '/realms/RCH/icon.png',
    name: 'Realms Community Hub',
    publicKey: new PublicKey('9efHuf3HAKiMDWNhgJyZW1Zyo8P7rRhAMXoJa9vpRo1e'),
    urlId: 'RCH',
  },
  {
    bannerImgSrc: '/realms/RCH/banner.png',
    description:
      'The standard for enabling modern communities to share ideas, make decisions, and collectively manage treasuries.',
    iconImgSrc: '/realms/RCH/icon.png',
    name: 'Realms Community Hub',
    publicKey: new PublicKey('9efHuf3HAKiMDWNhgJyZW1Zyo8P7rRhAMXoJa9vpRo1e'),
    urlId: 'RCH',
  },
];

interface Props {
  className?: string;
}

export function NotableGames(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <GameConsoleIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          notable games
        </div>
      </div>
      <div className="text-neutral-500 max-w-3xl">
        Following massive investment in AAA games, games built on Solana have
        ushered in a new era in digital ownership, social coordination, and
        token value.
      </div>
      <div
        className={cx(
          'grid',
          'mt-6',
          'gap-3',
          'items-center',
          'md:grid-cols-2',
          'lg:grid-cols-4',
          'xl:grid-cols-2',
          '2xl:grid-cols-4',
        )}
      >
        {ITEMS.map((item, i) => (
          <div className="flex-shrink-0 w-full 2xl:max-w-[290px] h-56" key={i}>
            <SmallCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
