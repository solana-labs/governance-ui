import { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import Link from 'next/link';
import { cloneElement } from 'react';

import { Twitter as TwitterIcon } from '@hub/components/icons/Twitter';
import { getCategoryIcon, getCategoryName } from '@hub/components/OrgCategory';
import { RealmIcon } from '@hub/components/RealmIcon';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { useQuery } from '@hub/hooks/useQuery';
import { abbreviateNumber } from '@hub/lib/abbreviateNumber';
import cx from '@hub/lib/cx';
import { getDefaultBannerUrl } from '@hub/lib/getDefaultBannerUrl';
import { RealmCategory } from '@hub/types/RealmCategory';
import * as RE from '@hub/types/Result';
import { RichTextDocument } from '@hub/types/RichTextDocument';

import * as gql from './gql';

interface Props {
  className?: string;
  bannerImgSrc?: null | string;
  category?: RealmCategory;
  description?: null | string;
  heading?: null | {
    document: RichTextDocument;
    isClipped: boolean;
  };
  iconImgSrc: null | string;
  name: string;
  publicKey: PublicKey;
  twitterFollowerCount?: null | number;
  urlId: string;
}

function getDescription(props: Props) {
  if (props.description) {
    return <div className="line-clamp-4">{props.description}</div>;
  }

  if (props.heading) {
    return (
      <RichTextDocumentDisplay
        document={props.heading.document}
        isClipped={props.heading.isClipped}
      />
    );
  }

  return 'No description provided';
}

export function SmallCard(props: Props) {
  const [result] = useQuery(gql.getRealmResp, {
    query: gql.getRealm,
    variables: { realm: props.publicKey },
    pause: typeof props.twitterFollowerCount === 'number',
  });

  return (
    <Link passHref href={`/realm/${props.urlId}/hub`}>
      <a
        className={cx(
          'block',
          'bg-white',
          'rounded',
          'overflow-hidden',
          'relative',
          'h-full',
          props.className,
        )}
      >
        <div
          className="h-16 bg-center bg-cover bg-white"
          style={{
            backgroundImage: `url(${
              props.bannerImgSrc || getDefaultBannerUrl(props.publicKey)
            })`,
          }}
        />
        <div className="pt-5 px-6 pb-7">
          <header className="flex items-center justify-between gap-x-2">
            <div className="font-bold text-neutral-900 truncate flex-shrink">
              {props.name}
            </div>
            {typeof props.twitterFollowerCount === 'number' ? (
              !!props.twitterFollowerCount ? (
                <div className="flex items-center">
                  <TwitterIcon className="fill-sky-500 h-3 w-3 mr-1" />
                  <div className="text-xs text-neutral-700">
                    {abbreviateNumber(props.twitterFollowerCount, undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              ) : null
            ) : (
              pipe(
                result,
                RE.match(
                  () => null,
                  () => null,
                  ({ hub }) =>
                    hub.twitterFollowerCount ? (
                      <div className="flex items-center">
                        <TwitterIcon className="fill-sky-500 h-3 w-3 mr-1" />
                        <div className="text-xs text-neutral-700">
                          {abbreviateNumber(
                            hub.twitterFollowerCount,
                            undefined,
                            {
                              maximumFractionDigits: 0,
                            },
                          )}
                        </div>
                      </div>
                    ) : null,
                ),
              )
            )}
          </header>
          {props.category && (
            <div className="flex items-center text-neutral-500">
              {cloneElement(getCategoryIcon(props.category), {
                className: cx('h-3', 'w-3', 'fill-current', 'mr-1'),
              })}
              <div className="text-xs">{getCategoryName(props.category)}</div>
            </div>
          )}
          <div
            className={cx(
              'text-sm',
              'text-neutral-700',
              props.category ? 'mt-3' : 'mt-2',
            )}
          >
            {getDescription(props)}
          </div>
        </div>
        <RealmIcon
          className={cx(
            'absolute',
            'border-[3px]',
            'border-white',
            'box-content',
            'h-11',
            'left-6',
            'top-8',
            'w-11',
            props.iconImgSrc && 'bg-neutral-100',
          )}
          iconUrl={props.iconImgSrc}
          name={props.name}
        />
      </a>
    </Link>
  );
}
