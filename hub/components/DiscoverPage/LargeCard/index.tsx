import { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import Link from 'next/link';

import { Twitter as TwitterIcon } from '@hub/components/icons/Twitter';
import { useQuery } from '@hub/hooks/useQuery';
import { abbreviateNumber } from '@hub/lib/abbreviateNumber';
import cx from '@hub/lib/cx';
import { RealmCategory } from '@hub/types/RealmCategory';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  className?: string;
  category: RealmCategory;
  content: React.ReactNode;
  imgSrc: string;
  publicKey: PublicKey;
  stats: {
    top: string;
    bottom: string;
  }[];
  title: string;
  urlId: string;
}

export function LargeCard(props: Props) {
  const [result] = useQuery(gql.getRealmResp, {
    query: gql.getRealm,
    variables: { realm: props.publicKey },
  });

  return (
    <Link passHref href={`/realm/${props.urlId}/hub`}>
      <a
        className={cx(
          'block',
          'overflow-hidden',
          'rounded',
          'transition-transform',
          'active:scale-95',
          'md:active:scale-[.98]',
          props.className,
        )}
      >
        <img className="w-full" src={props.imgSrc} />
        <div className="pt-3 px-6 pb-8">
          <header className="flex items-center justify-between">
            <div className="font-bold text-neutral-900">{props.title}</div>
            {pipe(
              result,
              RE.match(
                () => <div />,
                () => <div />,
                ({ hub }) =>
                  hub.twitterFollowerCount ? (
                    <div className="flex items-center">
                      <TwitterIcon className="fill-sky-500 h-4 w-4 mr-1" />
                      <div className="text-sm text-neutral-700">
                        {abbreviateNumber(hub.twitterFollowerCount, undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  ) : (
                    <div />
                  ),
              ),
            )}
          </header>
          <div className="mt-2 text-sm text-neutral-700 line-clamp-4 h-20">
            {props.content}
          </div>
          <div className="mt-6 grid grid-cols-3 items-center">
            {props.stats.map((stat, i) => (
              <div
                className={cx(
                  'border-l',
                  'border-neutral-300',
                  'flex',
                  'h-10',
                  'items-center',
                  'pl-3',
                )}
                key={i}
              >
                <div>
                  <div className="font-medium text-neutral-900">{stat.top}</div>
                  <div className="text-xs text-neutral-700">{stat.bottom}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </a>
    </Link>
  );
}
