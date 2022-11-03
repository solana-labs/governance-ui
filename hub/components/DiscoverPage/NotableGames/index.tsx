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
    bannerImgSrc: 'https://i.imgur.com/M57B2Xb.jpg',
    description:
      'Remix the world! A new card strategy racing game from a team that worked on HALO, FIFA, Battlefield & PokerStars. Mask Up!',
    iconImgSrc: 'https://i.imgur.com/PHo3WRt.jpg',
    name: 'MixMob',
    publicKey: new PublicKey('A3WX4QKcioruP71f4yweusv9jqU9R4LtGfJEHtZhs3Rx'),
    urlId: 'MixMob',
  },
  {
    bannerImgSrc: 'https://i.imgur.com/6Qmfw0l.png',
    description:
      'The Free-to-Play, Move-to-Earn NFT mobile game. Steps you take every day fuel your journey in the Genoverse. Move. Play. Create.',
    iconImgSrc: 'https://i.imgur.com/mEUafGW.png',
    name: 'Genopets',
    publicKey: new PublicKey('8gqpog28H6UvefDu7wMbwaRQX7a7rbVtw7z3yX9xjJQa'),
    urlId: 'Genopets',
  },
  {
    // bannerImgSrc: '/realms/RCH/banner.png',
    description:
      'Earth From Another Sun is an open-world MMO sandbox FPS game where you can command massive armies to fight & conquer the Galaxy.',
    iconImgSrc: 'https://i.imgur.com/2d1aeHo.png',
    name: 'Multiverse (Earth From Another Sun)',
    publicKey: new PublicKey('5K4VVEeYpANxL79r7rM3heyXqYZkzu2KkD4kFkt1gGpG'),
    urlId: 'Multiverse',
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
        Solana has enabled massive commercial success of numerous web3 games
        while developing resources for builders to create an even more vibrant
        ecosystem of services.
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
