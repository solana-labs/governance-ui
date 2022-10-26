import { pipe } from 'fp-ts/lib/function';

import { RealmCircle } from '@hub/components/branding/RealmCircle';
import { ITEMS as HACKATHON_ITEMS } from '@hub/components/DiscoverPage/Hackathon';
import { ITEMS as NFT_ITEMS } from '@hub/components/DiscoverPage/NotableNFTs';
import { ITEMS as PROJECT_ITEMS } from '@hub/components/DiscoverPage/NotableProjects';
import { ITEMS as POPULAR_ITEMS } from '@hub/components/DiscoverPage/Popular';
import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import { LoadingDots } from '@hub/components/LoadingDots';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

const ALREADY_DISPLAYED = new Set([
  ...HACKATHON_ITEMS.map((item) => item.publicKey.toBase58()),
  ...NFT_ITEMS.map((item) => item.publicKey.toBase58()),
  ...PROJECT_ITEMS.map((item) => item.publicKey.toBase58()),
  ...POPULAR_ITEMS.map((item) => item.publicKey.toBase58()),
]);

interface Props {
  className?: string;
}

export function AllOrgs(props: Props) {
  const [result] = useQuery(gql.getRealmsListResp, {
    query: gql.getRealmsList,
  });

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
            description: item.realm.shortDescription,
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
          .sort((a, b) => {
            let aScore = 0;
            let bScore = 0;

            if (a.description) {
              aScore += 100000;
            }

            if (b.description) {
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
              <RealmCircle className=" h-4 w-4" />
              <div className="text-sm text-neutral-700 uppercase font-semibold">
                all organizations building on solana
              </div>
            </div>
            <div className="text-neutral-500">
              All the projects and organizations on Solana
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
                <div className="flex-shrink-0 max-w-[290px] h-56" key={i}>
                  <SmallCard {...item} />
                </div>
              ))}
            </div>
          </section>
        );
      },
    ),
  );
}
