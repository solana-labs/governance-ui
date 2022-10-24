import ThumbUpIcon from '@carbon/icons-react/lib/ThumbsUp';
import { PublicKey } from '@solana/web3.js';

import { LargeCard } from '@hub/components/DiscoverPage/LargeCard';
import cx from '@hub/lib/cx';

export const ITEMS = [
  {
    imgSrc: '',
    content: <div />,
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    imgSrc: '',
    content: <div />,
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
  {
    imgSrc: '',
    content: <div />,
    publicKey: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    urlId: 'metaplex',
  },
];

interface Props {
  className?: string;
}

export function Popular(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <ThumbUpIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          popular on realms
        </div>
      </div>
      <div
        className={cx(
          'flex',
          'items-center',
          'no-scrollbar',
          'overflow-x-auto',
          'overflow-y-hidden',
          'pt-6',
          'snap-mandatory',
          'snap-x',
          'w-full',
        )}
      >
        {ITEMS.map((item, i) => (
          <div className="flex-shrink-0 snap-start pr-6" key={i}>
            <LargeCard className="bg-white" {...item} />
          </div>
        ))}
        <div className="w-6" />
      </div>
    </section>
  );
}
