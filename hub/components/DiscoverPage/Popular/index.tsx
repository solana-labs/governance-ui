import FireIcon from '@carbon/icons-react/lib/Fire';
import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';

export const ITEMS = [
  {
    bannerImgSrc: 'https://i.imgur.com/hDJj3dL.png',
    description:
      'Magic Eden is the leading NFT platform for discovery, expression, and ownership across digital cultures.',
    iconImgSrc: 'https://i.imgur.com/p9Ludt4.png',
    name: 'Magic Eden',
    publicKey: new PublicKey('9MwbgfEkV8ZaeycfciBqytcxwfdYHqD2NYjsTZkH4GxA'),
    urlId: 'Magic%20Eden',
  },
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
    bannerImgSrc: 'https://i.imgur.com/i1gGoIw.jpg',
    description:
      'Every market, all the power, none of the fuss. Simplifying decentralized finance through easy-to-use products and developer tools.',
    iconImgSrc: 'https://trade.mango.markets/assets/icons/logo.svg',
    name: 'Mango DAO',
    publicKey: new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'),
    urlId: 'MNGO',
  },
  {
    bannerImgSrc: 'https://i.imgur.com/ZiHW6ho.png',
    description:
      'Hello Moon provides innovative datasets on Solana to empower NFT & DeFi investors & traders.',
    iconImgSrc: 'https://www.hellomoon.io/Logo.svg',
    name: 'Hello Moon',
    publicKey: new PublicKey('G4CR3KUvqPZWmHbuvWhBPqL4vBBBujviyeTVynN2rhKB'),
    urlId: 'Hello%20Moon',
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
      {/* <div className="text-neutral-500">Solana projects gaining momentum</div> */}
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
