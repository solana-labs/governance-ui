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
      <div className="max-w-7xl mx-auto px-8 relative w-full md:px-8">
        <RealmHeaderIcon.Content
          className={cx('-translate-y-1/2', 'absolute', 'top-0')}
          iconUrl={iconUrl.src}
          realmName="Ecosystem"
        />
        <div
          className={cx(
            'flex',
            'items-center',
            'justify-between',
            'pb-8',
            'pl-4',
            'pr-4',
            'pt-4',
            'md:pl-48',
          )}
        >
          <div className="relative overflow-visible -mx-4 md:-mx-2">
            <div
              className={cx(
                'font-semibold',
                'text-3xl',
                'text-neutral-900',
                'mt-[52px]',
                'whitespace-nowrap',
                'md:relative',
                'md:mt-0',
                'md:whitespace-normal',
              )}
            >
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
