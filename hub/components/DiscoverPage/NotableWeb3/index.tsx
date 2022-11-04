import CubeIcon from '@carbon/icons-react/lib/Cube';
import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';

export const ITEMS = [
  {
    bannerImgSrc: 'https://i.imgur.com/zXTrhXU.png',
    description:
      'Bonfida has a simple, yet realistic goal of providing products and services that will enhance the Solana blockchain experience.',
    iconImgSrc: 'https://i.imgur.com/34Ss9kj.png',
    name: 'Bonfida DAO',
    publicKey: new PublicKey('6NzVDMfEBJvkFDnjPx53K7mLGW3yQdSjLhsamS8go4cn'),
    urlId: 'FIDA',
  },
  {
    bannerImgSrc: 'https://i.imgur.com/uW2laRX.png',
    description:
      'Holaplex provides a suite of web3 and NFT commerce solutions for businesses.',
    iconImgSrc: 'https://i.imgur.com/v9GE74q.png',
    name: 'Holaplex',
    publicKey: new PublicKey('4H282CCFjstxBd651gdhAydnXcjGk956Dk7p25MqxmfN'),
    urlId: 'Holaplex',
  },
  {
    bannerImgSrc: 'https://streamflow.finance/imgs/streamflow-logo-desktop.PNG',
    description:
      'Streamflow is the #1 token vesting and streaming platform on Solana.',
    iconImgSrc:
      'https://pbs.twimg.com/profile_images/1396561843146080259/VJNtxnX0_400x400.jpg',
    name: 'Streamflow',
    publicKey: new PublicKey('Bwjrnh5dGZ2tHZKjLtMNwwhtk8sCGfR1ZM8ZxcVCe87m'),
    urlId: 'Streamflow',
  },
  {
    bannerImgSrc:
      'https://www.wordcelclub.com/_next/static/media/user-default-banner.29900c53.png',
    description:
      'Building the Layer0 of Social Connections and Information Sharing on Solana.',
    iconImgSrc:
      'https://pbs.twimg.com/profile_images/1497183193061277697/eaH0ns0y_400x400.png',
    name: 'Wordcel Club',
    publicKey: new PublicKey('DP2wpegQpLFYq9ntSZewi8XR6AoTdw31dbvinSekZKjr'),
    urlId: 'Wordcel%20Club',
  },
];

interface Props {
  className?: string;
}

export function NotableWeb3(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <CubeIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          web3 projects
        </div>
      </div>
      <div className="text-neutral-500 max-w-3xl">
        With 16.3 million monthly users, decentralized technology built on
        Solana is quickly becoming the economic engine for many industries.
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
