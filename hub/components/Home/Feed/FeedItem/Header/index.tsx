import ChevronRightIcon from '@carbon/icons-react/lib/ChevronRight';
import type { PublicKey } from '@solana/web3.js';
import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';

import { FeedItemAuthor } from '../../gql';
import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { AuthorHovercard } from '@hub/components/AuthorHovercard';
import { ProposalStateBadge } from '@hub/components/ProposalStateBadge';
import { RealmHovercard } from '@hub/components/RealmHovercard';
import { RealmIcon } from '@hub/components/RealmIcon';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import { ProposalState } from '@hub/types/ProposalState';

const EDIT_GRACE_PERIOD = 3; // minutes

interface Props {
  className?: string;
  author?: FeedItemAuthor | null;
  created: number;
  feedItemRealmPublicKey?: null | PublicKey;
  feedItemRealm?: null | {
    iconUrl?: null | string;
    name: string;
    symbol?: null | string;
    urlId: string;
  };
  proposal?: {
    state: ProposalState;
    votingEnds?: number | null;
  };
  realmPublicKey: PublicKey;
  realm?: null | {
    name: string;
    symbol?: null | string;
  };
  updated: number;
  url: string;
}

export function Header(props: Props) {
  const authorName = props.author
    ? props.author.civicInfo?.handle ||
      props.author.twitterInfo?.handle ||
      abbreviateAddress(props.author.publicKey)
    : 'unknown author';

  const isEdited =
    Math.abs(differenceInMinutes(props.updated, props.created)) >
    EDIT_GRACE_PERIOD;

  const date = isEdited && props.proposal ? props.updated : props.created;
  const isCrosspost =
    !props.realmPublicKey.equals(ECOSYSTEM_PAGE) &&
    !!props.feedItemRealmPublicKey &&
    !props.realmPublicKey.equals(props.feedItemRealmPublicKey);

  return (
    <header
      className={cx(
        props.className,
        'flex',
        'items-center',
        'justify-between',
        'w-full',
      )}
    >
      <div className="flex items-baseline">
        {props.realm &&
          (props.realmPublicKey.equals(ECOSYSTEM_PAGE) ? (
            <div
              className={cx(
                'cursor-default',
                'font-medium',
                'hidden',
                'text-neutral-900',
                'text-sm',
                'sm:block',
                'sm:mr-2',
              )}
              onClick={(e) => e.stopPropagation()}
            >
              Solana Ecosystem
            </div>
          ) : (
            <Link
              passHref
              href={
                props.realm.symbol
                  ? `/realm/${props.realm.symbol}`
                  : `/realm/${props.realmPublicKey.toBase58()}`
              }
            >
              <RealmHovercard asChild publicKey={props.realmPublicKey}>
                <a
                  className={cx(
                    'block',
                    'font-medium',
                    'hidden',
                    'text-neutral-900',
                    'text-sm',
                    'truncate',
                    'hover:underline',
                    'sm:block',
                    'sm:mr-2',
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {props.realm.name}
                </a>
              </RealmHovercard>
            </Link>
          ))}
        <div className="flex items-center mr-2">
          {props.author ? (
            <AuthorHovercard
              asChild
              civicAvatar={props.author?.civicInfo?.avatarUrl}
              civicHandle={props.author?.civicInfo?.handle}
              publicKey={props.author?.publicKey}
              twitterAvatar={props.author?.twitterInfo?.avatarUrl}
              twitterHandle={props.author?.twitterInfo?.handle}
            >
              <div
                className="text-sm text-neutral-900 cursor-default flex items-baseline"
                onClick={(e) => e.stopPropagation()}
              >
                {props.realm && (
                  <AuthorAvatar
                    className="h-4 w-4 mr-1 text-[8px] self-center"
                    author={props.author}
                  />
                )}
                <div>{authorName}</div>
              </div>
            </AuthorHovercard>
          ) : (
            <div
              className="text-sm text-neutral-900 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {authorName}
            </div>
          )}
          {isCrosspost && props.feedItemRealm && props.feedItemRealmPublicKey && (
            <div
              className="flex items-center text-xs cursor-default ml-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-neutral-500">posted in</div>
              <Link passHref href={`/realm/${props.feedItemRealm.urlId}`}>
                <a
                  className={cx(
                    'bg-white',
                    'flex',
                    'font-medium',
                    'items-center',
                    'ml-2',
                    'px-2',
                    'py-1',
                    'rounded',
                    'text-neutral-900',
                    'transition-colors',
                    'hover:bg-neutral-200',
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <RealmIcon
                    className="h-4 w-4 text-[8px] mr-1"
                    iconUrl={props.feedItemRealm.iconUrl}
                    name={props.feedItemRealm.name}
                  />
                  <div>{props.feedItemRealm.name}</div>
                </a>
              </Link>
            </div>
          )}
        </div>
        {props.proposal ? (
          <a
            className="flex items-center space-x-1 text-neutral-500 text-xs hover:underline"
            href={props.url}
            target="_blank"
            rel="noreferrer"
          >
            <div>{formatDistanceToNowStrict(date)} ago</div>
            <ChevronRightIcon className="h-3 w-3 fill-current" />
          </a>
        ) : (
          <Link href={props.url} passHref>
            <a className="flex items-center space-x-1 text-neutral-500 text-xs hover:underline">
              <div>{formatDistanceToNowStrict(date)} ago</div>
              <ChevronRightIcon className="h-3 w-3 fill-current" />
            </a>
          </Link>
        )}
      </div>
      <div className="flex items-center">
        {props.proposal && (
          <ProposalStateBadge
            state={props.proposal.state}
            votingEnds={props.proposal.votingEnds || undefined}
          />
        )}
      </div>
    </header>
  );
}
