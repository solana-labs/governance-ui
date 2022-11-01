import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';
import { RealmCategory } from '@hub/types/RealmCategory';

import { Trophy } from './Trophy';

export const ITEMS = [
  {
    bannerImgSrc:
      'https://pbs.twimg.com/profile_banners/1488237042068819971/1652495773/1500x500',
    category: RealmCategory.Defi,
    description:
      'Sustainable Incentive Liquidity Infrastructure for Web3 Communities',
    iconImgSrc:
      'https://pbs.twimg.com/profile_images/1525300156551274497/FMlM80mn_400x400.jpg',
    name: 'Dual Finance',
    publicKey: new PublicKey('HnLuYmBxDxK1MCihHJVFnNudUTpLPc2km6xNcRQ8KPdj'),
    urlId: 'Dual%20Finance',
  },
  {
    bannerImgSrc:
      'https://worldtop.mypinata.cloud/ipfs/QmfA63uoZe8Dh5drYS7haQXJAMETovkoVCxS2MjcMHPPSA',
    category: RealmCategory.Web3,
    description:
      'BlockLive is fast, easy, transparent way to buy and sell live event tickets that you can hold onto for a lifetime.',
    iconImgSrc:
      'https://worldtop.mypinata.cloud/ipfs/QmXbMPq3Js6iJx6guEZsB8PaAPX6vB1Fr5wMRQnLavoUQk',
    name: 'BlockLive',
    publicKey: new PublicKey('G43QB1csngJDWBhrBCba5tbVcxcPHhGNtGkqfntfP6fg'),
    urlId: 'BlockLive',
  },
  {
    bannerImgSrc: 'https://i.imgur.com/Nk2lRMv.jpg',
    category: RealmCategory.Web3,
    description: 'The Search Engine for Blockchains',
    iconImgSrc: 'https://i.imgur.com/dwuDf3u.jpg',
    name: 'Ora',
    publicKey: new PublicKey('9dvvWxLNRv2HWRkc1FJdgpXuF9fDRZMsCbw6vTdHbp5'),
    urlId: 'Ora',
  },
  {
    bannerImgSrc: 'https://i.imgur.com/PwBA2It.png',
    category: RealmCategory.Gaming,
    description:
      'Building #Games4Good powered by Blockchain Technology on Solana and Celo',
    iconImgSrc:
      'https://intotheverse.xyz/static/media/logo.f2cbbe9e72f20f3706c979e20e711a96.svg',
    name: 'IntoTheVerse',
    publicKey: new PublicKey('22nDweMdSCCDoCMFUoS8Zgv7jnZxpLuqGrkL3cmSwuU3'),
    urlId: 'IntoTheVerse',
  },
  {
    bannerImgSrc: 'https://i.imgur.com/Gwq0ZLa.png',
    category: RealmCategory.DAOTools,
    description:
      'Bastion, leveling up the DAO experience both for the voter and for the DAO!',
    iconImgSrc: 'https://i.imgur.com/AnlE3V1.png',
    name: 'Bastion',
    publicKey: new PublicKey('G1RWjNmizVM6vR8pEsHta4iRYcTa7jWM1mQErz4phpRy'),
    urlId: 'Bastion',
  },
  {
    bannerImgSrc: '/realms/RCH/banner.png',
    category: RealmCategory.Web3,
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

export function Hackathon(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <Trophy className="h-7 w-7" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          hackathon winners
        </div>
      </div>
      <div className="text-neutral-500">
        Who’s who from this summer’s hackathon
      </div>
      <div
        className={cx(
          'gap-4',
          'grid',
          'justify-items-start',
          'mt-6',
          'md:grid-cols-2',
          'lg:grid-cols-3',
          'xl:grid-cols-2',
          '2xl:grid-cols-3',
        )}
      >
        {ITEMS.map((item, i) => (
          <div className="flex-shrink-0 w-full 2xl:max-w-[388px] h-60" key={i}>
            <SmallCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
