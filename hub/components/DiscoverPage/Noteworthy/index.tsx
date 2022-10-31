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
    imgSrc: imgAudius.src,
    category: RealmCategory.Web3,
    content: (
      <div>
        Audius isn’t just building a competitive music streaming platform. They
        are at the forefront of the conversation surrounding ownership rights by
        artists and fans.
      </div>
    ),
    publicKey: new PublicKey('9efHuf3HAKiMDWNhgJyZW1Zyo8P7rRhAMXoJa9vpRo1e'),
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
    urlId: 'RCH',
  },
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
    publicKey: new PublicKey('9efHuf3HAKiMDWNhgJyZW1Zyo8P7rRhAMXoJa9vpRo1e'),
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
    urlId: 'RCH',
  },
  {
    imgSrc: imgSms.src,
    category: RealmCategory.Web3,
    content: (
      <div>
        The Solana Mobile Stack and accompanying mobile Phone provides Web3
        natives native crypto experience on their phone. This new frontier
        features several opportunities including:
      </div>
    ),
    publicKey: new PublicKey('9efHuf3HAKiMDWNhgJyZW1Zyo8P7rRhAMXoJa9vpRo1e'),
    stats: [
      {
        top: 'Seed Vault',
        bottom: 'Wallet Hardware',
      },
      {
        top: 'Low Fees',
        bottom: 'dApp Transactions',
      },
      {
        top: 'OSOM',
        bottom: 'Premium Hardware',
      },
    ],
    title: 'Solana Mobile / SMS',
    urlId: 'RCH',
  },
  {
    imgSrc: imgMonkedao.src,
    category: RealmCategory.Web3,
    content: (
      <div>
        Monkedao is Community of Solana Monkey Business NFT owners operating a
        validator to increase the value of the DAO treasury. Virtual community
        events and IRL gatherings.
      </div>
    ),
    publicKey: new PublicKey('B1CxhV1khhj7n5mi5hebbivesqH9mvXr5Hfh2nD2UCh6'),
    stats: [
      {
        top: '43.3K SOL',
        bottom: 'In Stake Pool',
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
          noteworthy launches
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
              'w-[100vw]',
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
