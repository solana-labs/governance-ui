import { PublicKey } from '@solana/web3.js';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import { Category } from '@hub/components/OrgCategory';
import cx from '@hub/lib/cx';

import { Trophy } from './Trophy';

export const ITEMS = [
  {
    bannerImgSrc: '',
    category: Category.Web3,
    description:
      'Lorem ipsum doler sit amet. This is some sample description text.',
    iconImgSrc: '',
    name: 'Test org',
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    bannerImgSrc: '',
    category: Category.Web3,
    description:
      'Lorem ipsum doler sit amet. This is some sample description text.',
    iconImgSrc: '',
    name: 'Test org',
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    bannerImgSrc: '',
    category: Category.Web3,
    description:
      'Lorem ipsum doler sit amet. This is some sample description text.',
    iconImgSrc: '',
    name: 'Test org',
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    bannerImgSrc: '',
    category: Category.Web3,
    description:
      'Lorem ipsum doler sit amet. This is some sample description text.',
    iconImgSrc: '',
    name: 'Test org',
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    bannerImgSrc: '',
    category: Category.Web3,
    description:
      'Lorem ipsum doler sit amet. This is some sample description text.',
    iconImgSrc: '',
    name: 'Test org',
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    bannerImgSrc: '',
    category: Category.Web3,
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
      <div className={cx('grid', 'grid-cols-3', 'mt-6', 'gap-4')}>
        {ITEMS.map((item, i) => (
          <div className="flex-shrink-0 max-w-[388px] h-56" key={i}>
            <SmallCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
