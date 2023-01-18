import ToolsIcon from '@carbon/icons-react/lib/Tools';

import { Realm } from '../gql';
import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  realms: Realm[];
}

export function NotableDAOTooling(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <ToolsIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          dao tooling
        </div>
      </div>
      <div className="text-neutral-500 max-w-3xl">
        With over 1,700 DAOs, Solana is seeing massive growth in on-chain
        communities across DeFi, NFTs, and real world assets.
      </div>
      <div
        className={cx(
          'grid',
          'mt-6',
          'gap-3',
          'items-center',
          'md:grid-cols-2',
          'lg:grid-cols-4',
          'xl:grid-cols-2',
          '2xl:grid-cols-4',
        )}
      >
        {props.realms.map((realm, i) => (
          <div className="flex-shrink-0 w-full 2xl:max-w-[290px] h-56" key={i}>
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
