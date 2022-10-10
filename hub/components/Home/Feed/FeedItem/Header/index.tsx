import ChevronRightIcon from '@carbon/icons-react/lib/ChevronRight';
import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';

import { FeedItemAuthor } from '../../gql';
import { AuthorHovercard } from '@hub/components/AuthorHovercard';
import { ProposalStateBadge } from '@hub/components/ProposalStateBadge';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
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
              className="text-sm text-neutral-900 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {authorName}
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
            className="flex items-center space-x-1 text-neutral-500 text-xs"
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
            <a className="flex items-center space-x-1 text-neutral-500 text-xs">
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
