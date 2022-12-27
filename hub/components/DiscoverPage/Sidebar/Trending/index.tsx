import SignalStrengthIcon from '@carbon/icons-react/lib/SignalStrength';

import { Realm } from '../../gql';

import { Org } from './Org';

interface Props {
  className?: string;
  realms: Realm[];
}

export function Trending(props: Props) {
  return (
    <article className={props.className}>
      <header className="flex items-center space-x-2.5">
        <SignalStrengthIcon className="h-4 w-4 fill-neutral-500" />
        <div className="text-sm font-semibold text-neutral-900 uppercase">
          trending orgs
        </div>
      </header>
      <div className="mt-6 space-y-5">
        {props.realms.map((realm) => (
          <Org
            className="px-2"
            key={realm.publicKey.toBase58()}
            name={realm.name}
            category={realm.category}
            logo={realm.iconUrl || ''}
            publicKey={realm.publicKey}
            url={`/realm/${realm.urlId}`}
          />
        ))}
      </div>
    </article>
  );
}
