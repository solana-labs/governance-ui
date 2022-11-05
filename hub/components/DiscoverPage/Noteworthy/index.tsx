import ThumbUpIcon from '@carbon/icons-react/lib/ThumbsUp';
import { PublicKey } from '@solana/web3.js';

import { LargeCard } from '@hub/components/DiscoverPage/LargeCard';
import cx from '@hub/lib/cx';
import { RealmCategory } from '@hub/types/RealmCategory';

import imgAudius from './audius.png';
import imgMonkedao from './monkedao.png';
import imgSms from './sms.png';
import imgStaratlas from './staratlas.png';

export const ITEMS = [
  {
    imgSrc: imgStaratlas.src,
    category: RealmCategory.Gaming,
    content: (
      <div>
        Star Atlas is a grand strategy game of space exploration, territorial
        conquest, political domination, and living among the stars—all being
        built as a native Web3 experience.
      </div>
    ),
    publicKey: new PublicKey('52KrHUxbakN1rq9XoXQtSUmhdYyUZyp3YkWZQihZMTPu'),
    stats: [
      {
        top: '100%',
        bottom: 'Asset Ownership',
      },
      {
        top: 'Tokens',
        bottom: 'Dictate Game Rules',
      },
      {
        top: 'NFTs',
        bottom: 'Broad Uses',
      },
    ],
    title: 'Star Atlas',
    urlId: 'Star%20Atlas',
  },
  {
    imgSrc: imgSms.src,
    category: RealmCategory.Web3,
    content: (
      <div>
        Solana Mobiles’s inaugural flagship Saga phone offers a powerful mobile
        device enabled with native and seamless Web3 experiences. The Solana
        Mobile Stack provides the tools for developers to build truly mobile
        native dApps
      </div>
    ),
    publicKey: new PublicKey('ALzXvpmcmqmpNcFTbPzZ8ykSxHGqta85gTANfi8YPkPW'),
    stats: [
      {
        top: 'Seed Vault',
        bottom: 'Key Custody on Saga',
      },
      {
        top: 'dApp Store',
        bottom: 'Fee Free Txns',
      },
      {
        top: 'OSOM Design',
        bottom: 'Flagship Android',
      },
    ],
    title: 'Solana Mobile / Solana Mobile Stack',
    urlId: 'Solana%20Mobile',
  },
  {
    imgSrc: imgAudius.src,
    category: RealmCategory.Web3,
    content: (
      <div>
        Audius puts artists in control. It’s a fully decentralized music
        community and discovery platform owned and run by artists, fans, and
        developers around the world.
      </div>
    ),
    publicKey: new PublicKey('5Mt6EghNJHaPbNtHxH7tbbrMdwSP3sXcPRCqwPCbTVN4'),
    stats: [
      {
        top: '7.2M',
        bottom: 'Active Listeners',
      },
      {
        top: '250.7K',
        bottom: 'Artists',
      },
      {
        top: '1.1M',
        bottom: 'Songs Served',
      },
    ],
    title: 'Audius',
    urlId: 'Audius',
  },
  {
    imgSrc: imgMonkedao.src,
    category: RealmCategory.Web3,
    content: (
      <div>
        Monkedao is the community of Solana Monke Business owners, operating a
        validator to help secure Solana and fund the community both online and
        IRL.
      </div>
    ),
    publicKey: new PublicKey('B1CxhV1khhj7n5mi5hebbivesqH9mvXr5Hfh2nD2UCh6'),
    stats: [
      {
        top: '2,750',
        bottom: 'MonkeDAO Members',
      },
      {
        top: 'Up to 7%',
        bottom: 'Staking w/ DAOPool',
      },
      {
        top: '1st DAO',
        bottom: 'To Operate Validator',
      },
    ],
    title: 'Monke Dao',
    urlId: 'MonkeDAO',
  },
];

interface Props {
  className?: string;
}

export function Noteworthy(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <ThumbUpIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          spotlight
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
          'pr-10',
          'snap-mandatory',
          'snap-x',
          'w-full',
        )}
      >
        {ITEMS.map((item, i) => (
          <div
            className={cx(
              'flex-shrink-0',
              'snap-start',
              'pr-6',
              'w-[90vw]',
              'md:max-w-[496px]',
            )}
            key={i}
          >
            <LargeCard className="bg-white" {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
