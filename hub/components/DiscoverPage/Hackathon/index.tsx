import { Realm } from '../gql';
import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';

import { Trophy } from './Trophy';

interface Props {
  className?: string;
  realms: Realm[];
}

export function Hackathon(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <Trophy className="h-7 w-7" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          hackathon winners
        </div>
      </div>
      {/* <div className="text-neutral-500">
        Who’s who from this summer’s hackathon
      </div> */}
      <div
        className={cx(
          'gap-4',
          'grid',
          'justify-items-start',
          'mt-6',
          'md:grid-cols-2',
          'lg:grid-cols-3',
          'xl:grid-cols-2',
          '2xl:grid-cols-3',
        )}
      >
        {props.realms.map((realm, i) => (
          <div className="flex-shrink-0 w-full 2xl:max-w-[388px] h-60" key={i}>
            <SmallCard
              bannerImgSrc={realm.bannerImageUrl}
              category={realm.category}
              description={realm.shortDescription}
              heading={realm.clippedHeading}
              iconImgSrc={realm.iconUrl}
              name={realm.name}
              publicKey={realm.publicKey}
              twitterFollowerCount={realm.twitterFollowerCount}
              urlId={realm.urlId}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
