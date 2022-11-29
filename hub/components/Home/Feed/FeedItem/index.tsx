import MilestoneIcon from '@carbon/icons-react/lib/Milestone';
import type { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { FeedItem } from '../gql';
import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { AuthorHovercard } from '@hub/components/AuthorHovercard';
import { RealmIcon } from '@hub/components/RealmIcon';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
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
  realmInfo?: {
    iconUrl?: null | string;
    name: string;
    urlId: string;
  };
  realmUrlId: string;
}

function getUrl(props: Props) {
  if (props.realm.equals(ECOSYSTEM_PAGE)) {
    return `/ecosystem/${props.feedItem.id}`;
  }

  if (props.feedItem.type === FeedItemType.Post) {
    if (!props.feedItem.realmPublicKey.equals(props.realm)) {
      const urlId = props.realmInfo
        ? props.realmInfo.urlId
        : props.feedItem.realm.urlId;

      return `/realm/${urlId}/${props.feedItem.id}`;
    }

    return `/realm/${props.realmUrlId}/${props.feedItem.id}`;
  }

  return `/dao/${
    props.realmUrlId
  }/proposal/${props.feedItem.proposal.publicKey.toBase58()}`;
}

export function Content(props: Props) {
  const router = useRouter();

  const document = props.feedItem.clippedDocument.document;
  const isClipped = props.feedItem.clippedDocument.isClipped;
  const url = getUrl(props);
  const isCrosspost =
    !props.realm.equals(ECOSYSTEM_PAGE) &&
    !props.realm.equals(props.feedItem.realmPublicKey);

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
      <div className="relative">
        {isCrosspost && (
          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white p-[1px]">
            <div className="bg-sky-500 h-full w-full flex items-center justify-center rounded-full">
              <MilestoneIcon className="h-4 w-4 fill-white" />
            </div>
          </div>
        )}
        {props.realmInfo ? (
          <Link passHref href={`/realm/${props.realmInfo.urlId}`}>
            <a className="block">
              <RealmIcon
                className="h-12 w-12 text-lg"
                iconUrl={props.realmInfo.iconUrl}
                name={props.realmInfo.name}
              />
            </a>
          </Link>
        ) : props.feedItem.author ? (
          <AuthorHovercard
            civicAvatar={props.feedItem.author?.civicInfo?.avatarUrl}
            civicHandle={props.feedItem.author?.civicInfo?.handle}
            publicKey={props.feedItem.author?.publicKey}
            twitterAvatar={props.feedItem.author?.twitterInfo?.avatarUrl}
            twitterHandle={props.feedItem.author?.twitterInfo?.handle}
          >
            <AuthorAvatar
              author={props.feedItem.author}
              className="h-12 w-12 text-lg"
            />
          </AuthorHovercard>
        ) : (
          <AuthorAvatar
            author={props.feedItem.author}
            className="h-12 w-12 text-lg"
          />
        )}
      </div>
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
            feedItemRealmPublicKey={props.feedItem.realmPublicKey}
            feedItemRealm={props.feedItem.realm}
            proposal={
              props.feedItem.type === FeedItemType.Proposal
                ? {
                    state: props.feedItem.proposal.state,
                    votingEnds: props.feedItem.proposal.voteBreakdown.votingEnd,
                  }
                : undefined
            }
            realmPublicKey={props.realm}
            realm={props.realmInfo}
            updated={props.feedItem.updated}
            url={url}
          />
        </div>
        <div className="mt-3 text-neutral-900 font-bold transition-colors hover:text-sky-500">
          {props.feedItem.title}
        </div>
        <RichTextDocumentDisplay
          isPreview
          className="mt-4 text-neutral-900 text-sm"
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
          numReplies={props.feedItem.numComments}
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
