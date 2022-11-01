import FireIcon from '@carbon/icons-react/lib/Fire';
import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';

export const ITEMS = [
  {
    bannerImgSrc: 'https://i.imgur.com/VfFjhk5.jpeg',
    description:
      'GARI Network enables everyone to monetize their social media time and activities by leveraging web3 technologies.',
    iconImgSrc: 'https://i.imgur.com/t5hzoBV.jpg',
    name: 'GARI Network',
    publicKey: new PublicKey('uWg5gaTsBnXc5qiVMB8XxBUPYqLAb5bzzgkkpxi6UAY'),
    urlId: 'GARI%20Network',
  },
  {
    bannerImgSrc:
      'https://pbs.twimg.com/profile_banners/1512518742051237893/1666295049/1500x500',
    description: 'Experience the World of Solana. IRL.',
    iconImgSrc:
      'https://pbs.twimg.com/profile_images/1583182250581102623/AOrgeepS_400x400.jpg',
    name: 'Solana Spaces',
    publicKey: new PublicKey('58axqgJSAEK3adKL5hx5dYoRqkYMEiEXQZqk9FFFpa7f'),
    urlId: 'Solana%20Spaces',
  },
  {
    // bannerImgSrc: '/realms/RCH/banner.png',
    // description:
    //   'The standard for enabling modern communities to share ideas, make decisions, and collectively manage treasuries.',
    iconImgSrc:
      'https://assets.website-files.com/61284dcff241c2f0729af9f3/61285237ce2e301255d09108_logo-serum.png',
    name: 'Serum',
    publicKey: new PublicKey('G3FBDbsRiJjcjYuazrH6mRShFMjr9RQn4SxVVxocJavA'),
    urlId: 'SERUM2',
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

export function Popular(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <FireIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          popular projects
        </div>
      </div>
      <div className="text-neutral-500">Solana projects gaining momentum</div>
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
