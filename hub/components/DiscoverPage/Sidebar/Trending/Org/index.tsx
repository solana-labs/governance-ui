import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cloneElement } from 'react';

import { Twitter as TwitterIcon } from '@hub/components/icons/Twitter';
import {
  Category,
  getCategoryIcon,
  getCategoryName,
} from '@hub/components/OrgCategory';
import { RealmIcon } from '@hub/components/RealmIcon';
import { useQuery } from '@hub/hooks/useQuery';
import { abbreviateNumber } from '@hub/lib/abbreviateNumber';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

export { Category };

interface Props {
  category: Category;
  className?: string;
  logo: string;
  name: string;
  publicKey: PublicKey;
  url: string;
}

export function Org(props: Props) {
  const router = useRouter();
  const [result] = useQuery(gql.getRealmResp, {
    query: gql.getRealm,
    variables: { realm: props.publicKey },
  });

  return (
    <button
      className={cx(
        'gap-x-3',
        'grid-cols-[32px,1fr]',
        'grid',
        'group',
        'items-center',
        'text-left',
        'tracking-normal',
        'w-full',
        props.className,
      )}
      onClick={() => router.push(props.url)}
    >
      <RealmIcon className="h-8 w-8" iconUrl={props.logo} name={props.name} />
      <div
        className={cx(
          'grid-cols-[1fr,max-content]',
          'grid',
          'items-center',
          'w-full',
        )}
      >
        <div>
          <Link passHref href={props.url}>
            <a
              className={cx(
                'block',
                'font-bold',
                'text-neutral-900',
                'text-sm',
                'transition-colors',
                'group-hover:text-sky-500',
              )}
            >
              {props.name}
            </a>
          </Link>
          <div className="flex items-center space-x-1">
            {cloneElement(getCategoryIcon(props.category), {
              className: 'h-3 w-3 fill-neutral-500',
            })}
            <div className="text-xs text-neutral-500">
              {getCategoryName(props.category)}
            </div>
          </div>
        </div>
        {pipe(
          result,
          RE.match(
            () => <div className="w-20" />,
            () => <div className="w-20" />,
            ({ hub, realm }) =>
              hub?.twitterFollowerCount && realm?.twitterHandle ? (
                <a
                  className="flex items-center space-x-1"
                  href={`https://www.twitter.com/${realm.twitterHandle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <TwitterIcon className="fill-sky-500 h-3 w-3" />
                  <div className="text-xs text-neutral-700">
                    {abbreviateNumber(hub.twitterFollowerCount)}
                  </div>
                </a>
              ) : (
                <div className="w-20" />
              ),
          ),
        )}
      </div>
    </button>
  );
}
