import ToolsIcon from '@carbon/icons-react/lib/Tools';
import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';

export const ITEMS = [
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
    bannerImgSrc: '/realms/Squads/banner.png',
    description: 'The multisig standard you were looking for on Solana',
    iconImgSrc: 'https://i.imgur.com/CWBjdWH.png',
    name: 'Squads',
    publicKey: new PublicKey('BzGL6wbCvBisQ7s1cNQvDGZwDRWwKK6bhrV93RYdetzJ'),
    urlId: 'Squads',
  },
  {
    bannerImgSrc:
      'https://pbs.twimg.com/profile_banners/1443288033025937411/1633010666/1500x500',
    description:
      'Gilder makes interacting and staying connected to your decentralized internet community easy on mobile.',
    iconImgSrc:
      'https://pbs.twimg.com/profile_images/1458164179244765184/lqJUjPYh_400x400.jpg',
    name: 'Gilder',
    publicKey: new PublicKey('6jydyMWSqV2bFHjCHydEQxa9XfXQWDwjVqAdjBEA1BXx'),
    urlId: 'Gilder',
  },
  {
    bannerImgSrc: 'https://snipboard.io/I2pMe5.jpg',
    description:
      'Explore a web3 native way to raise, invest and govern assets. Your partner for every stage of your venture.',
    iconImgSrc: 'https://snipboard.io/9tpqwk.jpg',
    name: 'Unique Venture Clubs',
    publicKey: new PublicKey('5Dj3fuNLYxd1tzpPnXiPo88V8JNVHhrDScTLMJpupoXf'),
    urlId: 'Unique Venture Clubs',
  },
];

interface Props {
  className?: string;
}

export function NotableDAOTooling(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <ToolsIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          notable dao tooling
        </div>
      </div>
      <div className="text-neutral-500 max-w-3xl">
        With over 1,500 DAOs, Solana is seeing massive growth in on-chain
        communities across DeFi, NFTs, and real world assets.
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
