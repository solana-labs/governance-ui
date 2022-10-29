import * as RealmHeaderIcon from '@hub/components/RealmHeaderIcon';
import cx from '@hub/lib/cx';

import bannerUrl from './banner.png';
import iconUrl from './icon.png';

interface Props {
  className?: string;
}

export function EcosystemHeader(props: Props) {
  return (
    <header className={cx(props.className, 'bg-white')}>
      <div
        className={cx(
          'bg-center',
          'bg-cover',
          'h-60',
          'w-full',
          'bg-white',
          props.className,
        )}
        style={{ backgroundImage: `url("${bannerUrl.src}")` }}
      />
      <div className="max-w-7xl mx-auto px-8 relative w-full">
        <RealmHeaderIcon.Content
          className={cx('-translate-y-1/2', 'absolute', 'top-0')}
          iconUrl={iconUrl.src}
          realmName="Ecosystem"
        />
        <div className="pl-48 pt-4 pb-8 pr-4 flex items-center justify-between">
          <div className="-mx-2">
            <div className="font-semibold text-neutral-900 text-3xl">
              Solana Ecosystem
            </div>
            <div className="mt-1.5 text-sm text-neutral-700">
              All the updates from across the Solana ecosystem
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
