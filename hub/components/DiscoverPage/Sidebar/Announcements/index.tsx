import Bullhorn from '@carbon/icons-react/lib/Bullhorn';
import ChevronRightIcon from '@carbon/icons-react/lib/ChevronRight';
import Link from 'next/link';

import { Post as PostModel } from '../../gql';
import cx from '@hub/lib/cx';

import { Post } from './Post';

interface Props {
  className?: string;
  posts: PostModel[];
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
        {props.posts.map((post, i) => (
          <div
            className={cx(
              'gap-x-3',
              'grid-cols-[22px,1fr]',
              'grid',
              'items-center',
              'px-2',
            )}
            key={post.id}
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
            <Post post={post} />
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
