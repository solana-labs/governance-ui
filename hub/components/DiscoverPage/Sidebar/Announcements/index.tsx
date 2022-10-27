import Bullhorn from '@carbon/icons-react/lib/Bullhorn';
import ChevronRightIcon from '@carbon/icons-react/lib/ChevronRight';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';

import cx from '@hub/lib/cx';

import { Post } from './Post';

const CONFIG = [
  {
    postId: '1h9',
    realm: new PublicKey('H3e67AJqEx3yiWcSdP7g6qVkrAeCrpJSkQtxAKy7QYGK'),
  },
  {
    postId: '1h6',
    realm: new PublicKey('BzGL6wbCvBisQ7s1cNQvDGZwDRWwKK6bhrV93RYdetzJ'),
  },
  {
    postId: '1ha',
    realm: new PublicKey('DA5G7QQbFioZ6K33wQcH8fVdgFcnaDjLD7DLQkapZg5X'),
  },
  {
    postId: '1hd',
    realm: new PublicKey('B1CxhV1khhj7n5mi5hebbivesqH9mvXr5Hfh2nD2UCh6'),
  },
  {
    postId: '1h7',
    realm: new PublicKey('9efHuf3HAKiMDWNhgJyZW1Zyo8P7rRhAMXoJa9vpRo1e'),
  },
];

interface Props {
  className?: string;
}

export function Announcements(props: Props) {
  return (
    <article className={props.className}>
      <header className="flex items-center space-x-2.5">
        <Bullhorn className="h-4 w-4 fill-neutral-500" />
        <div className="text-sm font-semibold text-neutral-900 uppercase">
          key announcements
        </div>
      </header>
      <div className="mt-6 space-y-5">
        {CONFIG.map((item, i) => (
          <div
            className={cx(
              'gap-x-3',
              'grid-cols-[22px,1fr]',
              'grid',
              'items-center',
              'px-2',
            )}
            key={item.postId}
          >
            <div
              className={cx(
                'font-medium',
                'text-center',
                'text-neutral-900',
                'text-xs',
                'w-full',
              )}
            >
              {(i + 1).toFixed(0).padStart(2, '0')}
            </div>
            <Post {...item} />
          </div>
        ))}
      </div>
      <Link passHref href="/ecosystem">
        <a
          className={cx(
            'flex',
            'items-center',
            'justify-center',
            'mt-7',
            'space-x-1.5',
            'text-neutral-900',
            'w-full',
            'hover:text-sky-500',
          )}
        >
          <div className="text-sm transition-colors">
            More from the Ecosystem
          </div>
          <ChevronRightIcon className="fill-current h-4 w-4 transition-colors" />
        </a>
      </Link>
    </article>
  );
}
