import * as Separator from '@radix-ui/react-separator';
import type { PublicKey } from '@solana/web3.js';

import cx from '@hub/lib/cx';

import * as About from './About';
import * as Icon from './Icon';
import * as Treasury from './Treasury';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  compressed?: boolean;
  description?: string | null;
  iconUrl?: string | null;
  membersCount: number;
  realm: PublicKey;
  realmName: string;
  realmUrlId: string;
  twitterHandle?: string | null;
  websiteUrl?: string | null;
}

export function Content(props: Props) {
  return (
    <div className={cx(props.className, 'h-full', 'relative')}>
      <Icon.Content
        className={cx('-translate-y-1/2', 'absolute', 'top-0')}
        iconUrl={props.iconUrl}
        isStickied={props.compressed}
        realmName={props.realmName}
      />
      <h1 className="flex items-center text-neutral-900 text-xl font-bold mb-5 mt-0 pt-24">
        {props.iconUrl && (
          <img
            className={cx(
              'rounded-full',
              'transition-all',
              props.compressed ? 'h-8 w-8' : 'h-0 w-0',
              props.compressed ? 'mr-2' : 'mr-0',
            )}
            src={props.iconUrl}
          />
        )}
        {props.realmName}
      </h1>
      <Separator.Root className="bg-neutral-300 h-[1px]" />
      <About.Content
        className="pt-5 pb-7"
        description={props.description}
        membersCount={props.membersCount}
        twitterHandle={props.twitterHandle}
        websiteUrl={props.websiteUrl}
      />
      <Separator.Root className="bg-neutral-300 h-[1px]" />
      <Treasury.Content
        className="pt-5 pb-7"
        realm={props.realm}
        realmUrlId={props.realmUrlId}
      />
    </div>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div className={cx(props.className, 'h-full', 'relative')}>
      <Icon.Loading className={cx('-translate-y-1/2', 'absolute', 'top-0')} />
      <div className="h-24" />
      <h1 className="bg-neutral-200 rounded animate-pulse mb-5 mt-0 w-40">
        &nbsp;
      </h1>
      <Separator.Root className="bg-neutral-300 h-[1px]" />
      <About.Loading className="pt-5 pb-7" />
      <Separator.Root className="bg-neutral-300 h-[1px]" />
      <Treasury.Loading className="pt-5 pb-7" />
    </div>
  );
}

export function Error(props: BaseProps) {
  return (
    <div className={cx(props.className, 'h-full', 'relative')}>
      <Icon.Error className={cx('-translate-y-1/2', 'absolute', 'top-0')} />
      <div className="h-24" />
      <h1 className="bg-neutral-200 rounded mb-5 mt-0 w-40">&nbsp;</h1>
      <Separator.Root className="bg-neutral-300 h-[1px]" />
      <About.Error className="pt-5 pb-7" />
      <Separator.Root className="bg-neutral-300 h-[1px]" />
      <Treasury.Error className="pt-5 pb-7" />
    </div>
  );
}
