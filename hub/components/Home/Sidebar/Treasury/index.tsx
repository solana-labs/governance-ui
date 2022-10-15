import ArrowRightIcon from '@carbon/icons-react/lib/ArrowRight';
import WalletIcon from '@carbon/icons-react/lib/Wallet';
import { pipe } from 'fp-ts/function';
import * as IT from 'io-ts';
import { gql } from 'urql';

import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { BigNumber } from '@hub/types/decoders/BigNumber';
import { PublicKey } from '@hub/types/decoders/PublicKey';
import * as RE from '@hub/types/Result';

const query = gql`
  query realmTreasury($realm: PublicKey!) {
    realmTreasury(realm: $realm) {
      belongsTo
      totalValue
    }
  }
`;

const resp = IT.type({
  realmTreasury: IT.type({
    belongsTo: PublicKey,
    totalValue: BigNumber,
  }),
});

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  realm: PublicKey;
  realmUrlId: string;
}

export function Content(props: Props) {
  const [result] = useQuery(resp, {
    query,
    variables: { realm: props.realm.toBase58() },
  });

  return (
    <section className={props.className}>
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-neutral-500 text-xs">
          <WalletIcon className="h-4 w-4 fill-current" />
          <div>WALLETS & ASSETS</div>
        </div>
        <a
          className="flex items-center space-x-1 text-sm transition-colors text-neutral-500 hover:text-sky-500"
          href={`/dao/${props.realmUrlId}/treasury/v2`}
        >
          <div>View</div>
          <ArrowRightIcon className="h-4 w-4 fill-current" />
        </a>
      </header>
      <div className="text-sm mt-4 text-neutral-500">Total Value</div>
      {pipe(
        result,
        RE.match(
          () => <div className="mt-1 w-60 h-9 bg-neutral-200 rounded" />,
          () => (
            <div className="mt-1 w-60 h-9 bg-neutral-200 rounded animate-pulse" />
          ),
          ({ realmTreasury }) => (
            <div className="mt-1 font-bold text-3xl text-neutral-900">
              ${formatNumber(realmTreasury.totalValue)}
            </div>
          ),
        ),
      )}
    </section>
  );
}

export function Loading(props: BaseProps) {
  return (
    <section className={props.className}>
      <header className="flex items-center justify-between">
        <div className="bg-neutral-200 animate-pulse rounded text-xs w-20">
          &nbsp;
        </div>
        <div className="bg-neutral-200 animate-pulse rounded text-sm w-16">
          &nbsp;
        </div>
      </header>
      <div className="text-sm mt-4 bg-neutral-200 animate-pulse rounded w-16">
        &nbsp;
      </div>
      <div className="mt-1 w-60 h-9 bg-neutral-200 rounded animate-pulse" />
    </section>
  );
}

export function Error(props: BaseProps) {
  return (
    <section className={props.className}>
      <header className="flex items-center justify-between">
        <div className="bg-neutral-200 rounded text-xs w-20">&nbsp;</div>
        <div className="bg-neutral-200 rounded text-sm w-16">&nbsp;</div>
      </header>
      <div className="text-sm mt-4 bg-neutral-200 rounded w-16">&nbsp;</div>
      <div className="mt-1 w-60 h-9 bg-neutral-200 rounded" />
    </section>
  );
}
