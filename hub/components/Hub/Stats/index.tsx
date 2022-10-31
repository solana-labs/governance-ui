import ArrowRightIcon from '@carbon/icons-react/lib/ArrowRight';
import BookIcon from '@carbon/icons-react/lib/Book';
import WalletIcon from '@carbon/icons-react/lib/Wallet';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';

import { ExternalLink } from '@hub/components/icons/ExternalLink';
import { RealmsLogo } from '@hub/components/icons/RealmsLogo';
import { Twitter } from '@hub/components/icons/Twitter';
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
      {props.numMembers > 0 && (
        <Stat className="w-[25%]" icon={<RealmsLogo />} label="Org Members">
          {props.numMembers}
        </Stat>
      )}
      {!!props.twitterFollowers && (
        <Stat className="w-[25%]" icon={<Twitter />} label="Followers">
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
              className="w-[25%]"
              icon={<WalletIcon />}
              label="Treasury Value"
            >
              <div className="w-24 bg-neutral-200 rounded">&nbsp;</div>
            </Stat>
          ),
          () => (
            <Stat
              className="w-[25%]"
              icon={<WalletIcon />}
              label="Treasury Value"
            >
              <div className="w-24 bg-neutral-200 rounded animate-pulse">
                &nbsp;
              </div>
            </Stat>
          ),
          ({ realmTreasury }) =>
            realmTreasury.totalValue.isLessThan(1) ? null : (
              <Stat
                className="w-[25%]"
                icon={<WalletIcon />}
                label="Treasury Value"
              >
                <a
                  className="flex items-center"
                  href={`/dao/${props.realmUrlId}/treasury/v2`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>${abbreviateNumber(realmTreasury.totalValue)}</div>
                  <ArrowRightIcon className="h-4 w-4 fill-neutral-500 ml-2" />
                </a>
              </Stat>
            ),
        ),
      )}
      {props.documentation && (
        <Stat className="w-[25%]" icon={<BookIcon />} label="More Learning">
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
