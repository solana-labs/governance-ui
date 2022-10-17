import ChevronRightIcon from '@carbon/icons-react/lib/ChevronRight';
import type { PublicKey } from '@solana/web3.js';
import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';

import { FeedItemAuthor } from '../../gql';
import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { AuthorHovercard } from '@hub/components/AuthorHovercard';
import { ProposalStateBadge } from '@hub/components/ProposalStateBadge';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import { ProposalState } from '@hub/types/ProposalState';

const EDIT_GRACE_PERIOD = 3; // minutes

interface Props {
  className?: string;
  author?: FeedItemAuthor | null;
  created: number;
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
      <div className="flex items-baseline space-x-2">
        {props.realm &&
          (props.realmPublicKey.equals(ECOSYSTEM_PAGE) ? (
            <div
              className="font-medium text-sm text-neutral-900 mr-2 cursor-default"
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
              <a
                className="font-medium text-sm text-neutral-900 mr-2 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {props.realm.name}
              </a>
            </Link>
          ))}
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
        {props.proposal ? (
          <a
            className="flex items-center space-x-1 text-neutral-500 text-xs hover:underline"
            href={props.url}
            target="_blank"
            rel="noreferrer"
          >
            <div>
              {formatDistanceToNowStrict(date)} ago
              {isEdited && !props.proposal ? '*' : ''}
            </div>
            <ChevronRightIcon className="h-3 w-3 fill-current" />
          </a>
        ) : (
          <Link href={props.url} passHref>
            <a className="flex items-center space-x-1 text-neutral-500 text-xs hover:underline">
              <div>
                {formatDistanceToNowStrict(date)} ago
                {isEdited && !props.proposal ? '*' : ''}
              </div>
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
