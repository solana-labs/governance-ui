import SearchIcon from '@carbon/icons-react/lib/Search';
import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';

import { RealmCircle } from '@hub/components/branding/RealmCircle';
import { ITEMS as HACKATHON_ITEMS } from '@hub/components/DiscoverPage/Hackathon';
import { ITEMS as DEFI_ITEMS } from '@hub/components/DiscoverPage/NotableDefi';
import { ITEMS as GAME_ITEMS } from '@hub/components/DiscoverPage/NotableGames';
import { ITEMS as NFT_ITEMS } from '@hub/components/DiscoverPage/NotableNFTs';
import { ITEMS as WEB3_ITEMS } from '@hub/components/DiscoverPage/NotableWeb3';
import { ITEMS as NOTEWORTHY_ITEMS } from '@hub/components/DiscoverPage/Noteworthy';
import { ITEMS as POPULAR_ITEMS } from '@hub/components/DiscoverPage/Popular';
import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import { LoadingDots } from '@hub/components/LoadingDots';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import { RealmCategory } from '@hub/types/RealmCategory';
import * as RE from '@hub/types/Result';

import { CategorySelector } from './CategorySelector';
import * as gql from './gql';

const ALREADY_DISPLAYED = new Set([
  ...DEFI_ITEMS.map((item) => item.publicKey.toBase58()),
  ...GAME_ITEMS.map((item) => item.publicKey.toBase58()),
  ...HACKATHON_ITEMS.map((item) => item.publicKey.toBase58()),
  ...NFT_ITEMS.map((item) => item.publicKey.toBase58()),
  ...WEB3_ITEMS.map((item) => item.publicKey.toBase58()),
  ...POPULAR_ITEMS.map((item) => item.publicKey.toBase58()),
  ...NOTEWORTHY_ITEMS.map((item) => item.publicKey.toBase58()),
]);

interface Props {
  className?: string;
}

export function AllOrgs(props: Props) {
  const [result] = useQuery(gql.getRealmsListResp, {
    query: gql.getRealmsList,
  });

  const [textFilter, setTextFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RealmCategory[]>([]);

  return pipe(
    result,
    RE.match(
      () => null,
      () => (
        <section className={props.className}>
          <div className="flex items-center space-x-2">
            <RealmCircle className=" h-4 w-4" />
            <div className="text-sm text-neutral-700 uppercase font-semibold">
              all organizations building on solana
            </div>
          </div>
          <div className="text-neutral-500">
            All the projects and organizations on Solana
          </div>
          <div className={cx('flex', 'justify-center', 'items-center', 'mt-6')}>
            <div className="flex items-center">
              <div className="text-xs text-neutral-500 mr-2">
                Fetching all orgs
              </div>
              <LoadingDots style="pulse" />
            </div>
          </div>
        </section>
      ),
      ({ realmDropdownList }) => {
        const items = realmDropdownList
          .map((item) => ({
            bannerImgSrc: item.realm.bannerImageUrl,
            category: item.realm.category,
            description: item.realm.shortDescription,
            heading: item.realm.hub.info.clippedHeading,
            iconImgSrc: item.iconUrl,
            name: item.name,
            publicKey: item.publicKey,
            twitterFollowerCount: item.realm.hub.twitterFollowerCount,
            urlId: item.urlId,
          }))
          .filter((item) => {
            if (ALREADY_DISPLAYED.has(item.publicKey.toBase58())) {
              return false;
            }

            return true;
          })
          .filter((item) => {
            if (!categoryFilter.length) {
              return true;
            }

            return categoryFilter.includes(item.category);
          })
          .filter((item) => {
            if (!textFilter) {
              return true;
            }

            return item.name
              .toLocaleLowerCase()
              .includes(textFilter.toLocaleLowerCase());
          })
          .sort((a, b) => {
            let aScore = 0;
            let bScore = 0;

            if (a.description || a.heading) {
              aScore += 100000;
            }

            if (b.description || b.heading) {
              bScore += 100000;
            }

            aScore += a.twitterFollowerCount;
            bScore += b.twitterFollowerCount;

            if (aScore === bScore) {
              return a.name
                .toLocaleLowerCase()
                .localeCompare(b.name.toLocaleLowerCase());
            } else {
              return bScore - aScore;
            }
          });

        return (
          <section className={props.className}>
            <div className="flex items-center space-x-2">
              <RealmCircle className="h-4 w-4" />
              <div className="text-sm text-neutral-700 uppercase font-semibold">
                all organizations building on solana
              </div>
            </div>
            <div className="text-neutral-500">
              All the projects and organizations on Solana
            </div>
            <div className="mt-3 grid grid-cols-4 gap-x-3">
              <div className="relative">
                <input
                  className={cx(
                    'bg-white',
                    'border-neutral-200',
                    'border',
                    'h-10',
                    'pl-10',
                    'pr-4',
                    'py-2.5',
                    'rounded',
                    'text-neutral-900',
                    'text-sm',
                    'w-full',
                    'placeholder:text-neutral-500',
                    'placeholder:transition-colors',
                    'focus:placeholder:text-neutral-300',
                  )}
                  placeholder="Search Hubs"
                  value={textFilter}
                  onChange={(e) => setTextFilter(e.currentTarget.value)}
                />
                <SearchIcon
                  className={cx(
                    '-translate-y-1/2',
                    'absolute',
                    'h-4',
                    'left-4',
                    'text-neutral-900',
                    'top-1/2',
                    'w-4',
                  )}
                />
              </div>
              <div className="col-span-3">
                <CategorySelector
                  selected={categoryFilter}
                  onChange={(categories) => setCategoryFilter(categories)}
                />
              </div>
            </div>
            <div
              className={cx(
                'grid',
                'grid-cols-4',
                'mt-6',
                'gap-3',
                'items-center',
              )}
            >
              {items.map((item, i) => (
                <div className="flex-shrink-0 max-w-[290px] h-60" key={i}>
                  <SmallCard {...item} />
                </div>
              ))}
            </div>
            {(!!textFilter || !!categoryFilter.length) && !items.length && (
              <div className="flex flex-col items-center gap-y-2">
                <div className="text-neutral-900 text-sm">
                  There are no orgs matching your filters
                </div>
                <button
                  className={cx(
                    'text-sky-500',
                    'tracking-normal',
                    'transition-colors',
                    'hover:text-sky-400',
                  )}
                  onClick={() => {
                    setTextFilter('');
                    setCategoryFilter([]);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </section>
        );
      },
    ),
  );
}
