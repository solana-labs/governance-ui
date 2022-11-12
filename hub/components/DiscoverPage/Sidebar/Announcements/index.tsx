import Bullhorn from '@carbon/icons-react/lib/Bullhorn';
import ChevronRightIcon from '@carbon/icons-react/lib/ChevronRight';
import { pipe } from 'fp-ts/lib/function';
import Link from 'next/link';

import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';
import { Post } from './Post';

const CONFIG = [
  {
    postId: '2ay',
  },
  {
    postId: '2a7',
  },
  {
    postId: '2b0',
  },
  {
    postId: '2aq',
  },
  {
    postId: '2b6',
  },
];

interface Props {
  className?: string;
}

export function Announcements(props: Props) {
  const [result] = useQuery(gql.getPostResp, {
    query: gql.getPost,
    variables: { ids: CONFIG.map((item) => item.postId) },
  });

  return (
    <article className={props.className}>
      <header className="flex items-center space-x-2.5">
        <Bullhorn className="h-4 w-4 fill-neutral-500" />
        <div className="text-sm font-semibold text-neutral-900 uppercase">
          key announcements
        </div>
      </header>
      <div className="mt-6 space-y-5">
        {pipe(
          result,
          RE.match(
            () =>
              CONFIG.map((item) => (
                <div
                  className={cx('bg-neutral-200', 'h-8', 'rounded', 'w-full')}
                  key={item.postId}
                />
              )),
            () =>
              CONFIG.map((item) => (
                <div
                  className={cx(
                    'animate-pulse',
                    'bg-neutral-200',
                    'h-8',
                    'rounded',
                    'w-full',
                  )}
                  key={item.postId}
                />
              )),
            ({ feedItems }) =>
              CONFIG.map(({ postId }, i) => {
                const post = feedItems.find((item) => item.id === postId);

                if (post) {
                  return (
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
                  );
                }

                return null;
              }),
          ),
        )}
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
