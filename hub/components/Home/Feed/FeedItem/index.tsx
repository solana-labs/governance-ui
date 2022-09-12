import type { PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/router';

import { FeedItem } from '../gql';
import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import cx from '@hub/lib/cx';
import { FeedItemType } from '@hub/types/FeedItemType';
import { ProposalState } from '@hub/types/ProposalState';

import { Controls } from './Controls';
import { Header } from './Header';
import { Proposal } from './Proposal';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  feedItem: FeedItem;
  realm: PublicKey;
  realmUrlId: string;
}

export function Content(props: Props) {
  const router = useRouter();

  const document = props.feedItem.clippedDocument.document;
  const isClipped = props.feedItem.clippedDocument.isClipped;

  const url =
    props.feedItem.type === FeedItemType.Post
      ? `/realm/${props.realmUrlId}/${props.feedItem.id}`
      : `/dao/${
          props.realmUrlId
        }/proposal/${props.feedItem.proposal.publicKey.toBase58()}`;

  return (
    <article
      className={cx(
        props.className,
        'grid',
        'grid-cols-[48px,1fr]',
        'items-start',
        'gap-x-3',
      )}
    >
      <AuthorAvatar
        author={props.feedItem.author}
        className="h-12 w-12 text-lg"
      />
      <div
        className="text-left w-full overflow-hidden cursor-pointer"
        onClick={() => {
          if (props.feedItem.type === FeedItemType.Post) {
            router.push(url);
          } else {
            window.open(url, '_blank');
          }
        }}
      >
        <div className="flex items-center justify-between">
          <Header
            author={props.feedItem.author}
            created={props.feedItem.created}
            proposal={
              props.feedItem.type === FeedItemType.Proposal
                ? {
                    state: props.feedItem.proposal.state,
                    votingEnds: props.feedItem.proposal.voteBreakdown.votingEnd,
                  }
                : undefined
            }
            updated={props.feedItem.updated}
            url={url}
          />
        </div>
        <div className="mt-3 text-neutral-900 font-bold">
          {props.feedItem.title}
        </div>
        <RichTextDocumentDisplay
          className="mt-4 text-neutral-700"
          isClipped={isClipped}
          document={document}
          onExpand={() => {
            if (props.feedItem.type === FeedItemType.Post) {
              router.push(url);
            } else {
              window.open(url, '_blank');
            }
          }}
        />
        {props.feedItem.type === FeedItemType.Proposal &&
          props.feedItem.proposal.state === ProposalState.Voting && (
            <Proposal className="mt-4 max-w-xl" proposal={props.feedItem} />
          )}
        <Controls
          className="mt-4 max-w-xl"
          feedItemId={props.feedItem.id}
          realm={props.realm}
          score={props.feedItem.score}
          totalProposalVotes={
            props.feedItem.type === FeedItemType.Proposal &&
            props.feedItem.proposal.state === ProposalState.Voting
              ? props.feedItem.proposal.voteBreakdown.totalYesWeight.plus(
                  props.feedItem.proposal.voteBreakdown.totalNoWeight,
                )
              : null
          }
          userVote={props.feedItem.myVote}
        />
      </div>
    </article>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div
      className={cx(
        props.className,
        'grid',
        'grid-cols-[48px,1fr]',
        'items-start',
        'gap-x-3',
      )}
    >
      <div className="w-12 h-12 rounded-full bg-neutral-200 animate-pulse" />
      <div className="w-full h-36 rounded bg-neutral-200 animate-pulse" />
    </div>
  );
}

export function Error(props: BaseProps) {
  return (
    <div
      className={cx(
        props.className,
        'grid',
        'grid-cols-[48px,1fr]',
        'items-start',
        'gap-x-3',
      )}
    >
      <div className="w-12 h-12 rounded-full bg-neutral-200" />
      <div className="w-full h-36 rounded bg-neutral-200" />
    </div>
  );
}
