import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import { NFT as NFTIcon } from '@hub/components/icons/NFT';
import cx from '@hub/lib/cx';

export const ITEMS = [
  {
    bannerImgSrc: '',
    description:
      'Lorem ipsum doler sit amet. This is some sample description text.',
    iconImgSrc: '',
    name: 'Test org',
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    bannerImgSrc: '',
    description:
      'Lorem ipsum doler sit amet. This is some sample description text.',
    iconImgSrc: '',
    name: 'Test org',
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    bannerImgSrc: '',
    description:
      'Lorem ipsum doler sit amet. This is some sample description text.',
    iconImgSrc: '',
    name: 'Test org',
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    bannerImgSrc: '',
    description:
      'Lorem ipsum doler sit amet. This is some sample description text.',
    iconImgSrc: '',
    name: 'Test org',
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
];

interface Props {
  className?: string;
}

export function NotableNFTs(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <NFTIcon className="stroke-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          notable nft collections
        </div>
      </div>
      <div className="text-neutral-500">
        Solana has minted 2B NFTs through Metaplex, and currently has more NFTs
        in its ecosystem than Ethereum
      </div>
      <div
        className={cx('grid', 'grid-cols-4', 'mt-6', 'gap-3', 'items-center')}
      >
        {ITEMS.map((item, i) => (
          <div className="flex-shrink-0 max-w-[290px] h-56" key={i}>
            <SmallCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
