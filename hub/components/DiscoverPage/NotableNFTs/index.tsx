import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import { NFT as NFTIcon } from '@hub/components/icons/NFT';
import cx from '@hub/lib/cx';

export const ITEMS = [
  {
    bannerImgSrc: 'https://i.imgur.com/NfXLoSZ.jpg',
    description:
      'Okay Bears has the highest trade volume of any NFT collection on Solana and is an emerging global icon of clean, positive cool.',
    iconImgSrc: 'https://i.imgur.com/eKF74mG.png',
    name: 'Okay Bears',
    publicKey: new PublicKey('DntR8BU5tYVhQUNfARFG5VxKrpdRaKY2qKC3v8cYJirm'),
    urlId: 'Okay Bears',
  },
  {
    bannerImgSrc: 'https://i.imgur.com/wgLWNen.png',
    // description:
    //   'The standard for enabling modern communities to share ideas, make decisions, and collectively manage treasuries.',
    iconImgSrc: 'https://i.imgur.com/j6VhuZJ.png',
    name: 'Degenerate Ape Academy',
    publicKey: new PublicKey('7f47FkSAJqJLNY5p3jKxp7CLbEYbQDhhmKuYDJKrNJEq'),
    urlId: 'Degenerate Ape Academy',
  },
  {
    // bannerImgSrc: '/realms/RCH/banner.png',
    description:
      'Degods is on a mission to build the best communities on the internet.',
    // iconImgSrc: '/realms/RCH/icon.png',
    name: 'DeGods',
    publicKey: new PublicKey('wx9R4TZLgL4VaVK89uW9D9DpMKMUCSm16nABeahk9Ex'),
    urlId: 'DeGods',
  },
  {
    // bannerImgSrc: '/realms/RCH/banner.png',
    // description:
    //   'The standard for enabling modern communities to share ideas, make decisions, and collectively manage treasuries.',
    iconImgSrc: '/realms/RAIN/img/rain_logo.png',
    name: 'The Imperium of Rain',
    publicKey: new PublicKey('6orGiJYGXYk9GT2NFoTv2ZMYpA6asMieAqdek4YRH2Dn'),
    urlId: 'DTP',
  },
];

interface Props {
  className?: string;
}

export function NotableNFTs(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <NFTIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          notable nft collections
        </div>
      </div>
      <div className="text-neutral-500 max-w-3xl">
        With nearly 22 million minted, Solana NFTs have generated more than $3.6
        Billion in sales to more than 2.5 million collectors.
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
