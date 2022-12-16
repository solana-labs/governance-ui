import { Realm } from '../gql';
import { Org } from '@hub/components/DiscoverPage/Sidebar/Trending/Org';
import { RealmSearchSelector } from '@hub/components/RealmSearchSelector';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  value: Realm;
  onChange?(value: Realm): void;
}

export function TrendingSelect(props: Props) {
  return (
    <div className={cx(props.className, 'grid', 'grid-cols-6', 'gap-x-2')}>
      <Org
        className="col-span-2 pr-10"
        category={props.value.category}
        logo={props.value.iconUrl || ''}
        name={props.value.name}
        publicKey={props.value.publicKey}
        url={props.value.urlId}
      />
      <RealmSearchSelector
        selected={props.value.publicKey}
        onSelect={props.onChange}
      />
    </div>
  );
}
