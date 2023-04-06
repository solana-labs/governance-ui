import { Realm } from '../gql';
import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import { RealmSearchSelector } from '@hub/components/RealmSearchSelector';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  value: Realm;
  onChange?(value?: Realm): void;
}

export function RealmSelect(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'flex',
        'flex-col',
        'items-center',
        'space-y-2',
      )}
    >
      <SmallCard
        compressable
        className="w-full"
        bannerImgSrc={props.value.bannerImageUrl}
        category={props.value.category}
        description={props.value.shortDescription}
        heading={props.value.clippedHeading}
        iconImgSrc={props.value.iconUrl}
        name={props.value.name}
        publicKey={props.value.publicKey}
        twitterFollowerCount={props.value.twitterFollowerCount}
        urlId={props.value.urlId}
      />
      <RealmSearchSelector
        selected={props.value.publicKey}
        onSelect={props.onChange}
      />
    </div>
  );
}
