import ArrowRightIcon from '@carbon/icons-react/lib/ArrowRight';
import BookIcon from '@carbon/icons-react/lib/Book';
import LaunchIcon from '@carbon/icons-react/lib/Launch';
import TwitterIcon from '@carbon/icons-react/lib/LogoTwitter';
import WalletIcon from '@carbon/icons-react/lib/Wallet';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';
import Link from 'next/link';

import { RealmsLogo } from '@hub/components/icons/RealmsLogo';
import { useQuery } from '@hub/hooks/useQuery';
import { abbreviateNumber } from '@hub/lib/abbreviateNumber';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';
import { Stat } from './Stat';

interface Props {
  className?: string;
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
    <div className={cx('flex', 'items-center', props.className)}>
      <Stat className="w-[25%]" icon={<RealmsLogo />} label="Org Members">
        {props.numMembers}
      </Stat>
      {props.twitterFollowers && (
        <Stat className="w-[25%]" icon={<TwitterIcon />} label="Followers">
          {abbreviateNumber(props.twitterFollowers, undefined, {
            maximumFractionDigits: 1,
          })}
        </Stat>
      )}
      <Stat className="w-[25%]" icon={<WalletIcon />} label="Treasury Value">
        {pipe(
          treasuryResult,
          RE.match(
            () => <div className="w-24 bg-neutral-200 rounded">&nbsp;</div>,
            () => (
              <div className="w-24 bg-neutral-200 rounded animate-pulse">
                &nbsp;
              </div>
            ),
            ({ realmTreasury }) => (
              <Link passHref href={`/dao/${props.realmUrlId}/treasury/v2`}>
                <a className="flex items-center">
                  <div>${abbreviateNumber(realmTreasury.totalValue)}</div>
                  <ArrowRightIcon className="h-4 w-4 fill-neutral-500 ml-2" />
                </a>
              </Link>
            ),
          ),
        )}
      </Stat>
      {props.documentation && (
        <Stat className="w-[25%]" icon={<BookIcon />} label="Documentation">
          <a
            className="flex items-center"
            href={props.documentation.url}
            target="_blank"
            rel="noreferrer"
          >
            {props.documentation.title || 'Docs'}
            <LaunchIcon className="h-4 w-4 fill-neutral-500 ml-2" />
          </a>
        </Stat>
      )}
    </div>
  );
}
