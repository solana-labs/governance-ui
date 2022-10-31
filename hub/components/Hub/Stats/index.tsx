import ArrowRightIcon from '@carbon/icons-react/lib/ArrowRight';
import BookIcon from '@carbon/icons-react/lib/Book';
import WalletIcon from '@carbon/icons-react/lib/Wallet';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';

import { ExternalLink } from '@hub/components/icons/ExternalLink';
import { Twitter } from '@hub/components/icons/Twitter';
import { getCategoryIcon, getCategoryName } from '@hub/components/OrgCategory';
import { useQuery } from '@hub/hooks/useQuery';
import { abbreviateNumber } from '@hub/lib/abbreviateNumber';
import cx from '@hub/lib/cx';
import { RealmCategory } from '@hub/types/RealmCategory';
import * as RE from '@hub/types/Result';

import * as gql from './gql';
import { Stat } from './Stat';

interface Props {
  className?: string;
  category: RealmCategory;
  documentation?: null | {
    title?: null | string;
    url: string;
  };
  numMembers: number;
  realm: PublicKey;
  realmUrlId: string;
  twitterFollowers?: number;
}

export function Stats(props: Props) {
  const [treasuryResult] = useQuery(gql.getTreasuryValueResp, {
    query: gql.getTreasuryValue,
    variables: { realm: props.realm.toBase58() },
  });

  return (
    <div
      className={cx(
        'flex',
        'items-center',
        'no-scrollbar',
        'overflow-x-auto',
        'snap-mandatory',
        'snap-x',
        'w-full',
        props.className,
      )}
    >
      <Stat
        className="flex-shrink-0 snap-start sm:w-[25%]"
        icon={getCategoryIcon(props.category)}
        label="Org Type"
      >
        {getCategoryName(props.category)}
      </Stat>
      {!!props.twitterFollowers && (
        <Stat
          className="flex-shrink-0 snap-start sm:w-[25%]"
          icon={<Twitter />}
          label="Followers"
        >
          {abbreviateNumber(props.twitterFollowers, undefined, {
            maximumFractionDigits: 1,
          })}
        </Stat>
      )}

      {pipe(
        treasuryResult,
        RE.match(
          () => (
            <Stat
              className="flex-shrink-0 snap-start sm:w-[25%]"
              icon={<WalletIcon />}
              label="Treasury Value"
            >
              <div className="w-24 bg-neutral-200 rounded">&nbsp;</div>
            </Stat>
          ),
          () => (
            <Stat
              className="flex-shrink-0 snap-start sm:w-[25%]"
              icon={<WalletIcon />}
              label="Treasury Value"
            >
              <div className="w-24 bg-neutral-200 rounded animate-pulse">
                &nbsp;
              </div>
            </Stat>
          ),
          ({ realmTreasury }) => (
            <Stat
              className="flex-shrink-0 snap-start sm:w-[25%]"
              icon={<WalletIcon />}
              label="Treasury Value"
            >
              <a
                className="flex items-center"
                href={`/dao/${props.realmUrlId}/treasury/v2`}
                target="_blank"
                rel="noreferrer"
              >
                <div>
                  {realmTreasury.totalValue.isLessThan(1)
                    ? 'N/A'
                    : `${abbreviateNumber(realmTreasury.totalValue)}`}
                </div>
                <ArrowRightIcon className="h-4 w-4 fill-neutral-500 ml-2" />
              </a>
            </Stat>
          ),
        ),
      )}
      {props.documentation && (
        <Stat
          className="flex-shrink-0 snap-start sm:w-[25%]"
          icon={<BookIcon />}
          label="More Learning"
        >
          <a
            className="flex items-center"
            href={props.documentation.url}
            target="_blank"
            rel="noreferrer"
          >
            {props.documentation.title || 'Docs'}
            <ExternalLink className="h-4 w-4 fill-neutral-500 ml-2" />
          </a>
        </Stat>
      )}
    </div>
  );
}
