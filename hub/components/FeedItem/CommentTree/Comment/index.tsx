import type { PublicKey } from '@solana/web3.js';
import { formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';

import { FeedItemComment } from '../../gql';
import * as ReplyBox from '../../ReplyBox';
import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { AuthorHovercard } from '@hub/components/AuthorHovercard';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import { filterUniqueBy } from '@hub/lib/filterUniqueBy';
import { useUserCreatedFeedItemCommentRepliesStore } from '@hub/stores/userCreatedFeedItemCommentReplies';
import { BlockNodeType } from '@hub/types/RichTextDocument';

import { Controls } from './Controls';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  comment: FeedItemComment;
  feedItemId: string;
  realm: PublicKey;
  realmUrlId: string;
  userIsAdmin?: boolean;
  onDelete?(): void;
}

export function Content(props: Props) {
  const [replyBoxOpen, setReplyBoxOpen] = useState(false);
  const userReplies = useUserCreatedFeedItemCommentRepliesStore(
    (state) => state.comments[props.comment.id],
  );

  const authorName = props.comment.author
    ? props.comment.author.civicInfo?.handle ||
      props.comment.author.twitterInfo?.handle ||
      abbreviateAddress(props.comment.author.publicKey)
    : 'unknown author';

  const replies = (userReplies || []).concat(props.comment.replies || []);
  const originalRepliesCount = props.comment.replies?.length || 0;
  const url = props.realm.equals(ECOSYSTEM_PAGE)
    ? `/ecosystem/${props.feedItemId}/${props.comment.id}`
    : `/realm/${props.realmUrlId}/${props.feedItemId}/${props.comment.id}`;

  return (
    <article className={cx(props.className, 'w-full')}>
      <div className={cx('grid', 'grid-cols-[32px,1fr]', 'gap-x-3')}>
        <div className="relative">
          {props.comment.author ? (
            <AuthorHovercard
              civicAvatar={props.comment.author?.civicInfo?.avatarUrl}
              civicHandle={props.comment.author?.civicInfo?.handle}
              publicKey={props.comment.author?.publicKey}
              twitterAvatar={props.comment.author?.twitterInfo?.avatarUrl}
              twitterHandle={props.comment.author?.twitterInfo?.handle}
            >
              <AuthorAvatar
                author={props.comment.author}
                className="h-8 w-8 text-sm"
              />
            </AuthorHovercard>
          ) : (
            <AuthorAvatar
              author={props.comment.author}
              className="h-8 w-8 text-sm"
            />
          )}
          {(!!replies.length ||
            !!props.comment.repliesCount ||
            replyBoxOpen) && (
            <div
              className={cx(
                'absolute',
                'bg-clip-padding',
                'border-l-[1px]',
                'border-neutral-400',
                'border-solid',
                'bottom-0',
                'left-1/2',
                'top-9',
              )}
            />
          )}
        </div>
        <div
          className={cx(
            'text-neutral-900',
            (!!replies.length || replyBoxOpen) && 'pb-8',
          )}
        >
          <header className="flex items-baseline">
            {props.comment.author ? (
              <AuthorHovercard
                asChild
                civicAvatar={props.comment.author?.civicInfo?.avatarUrl}
                civicHandle={props.comment.author?.civicInfo?.handle}
                publicKey={props.comment.author?.publicKey}
                twitterAvatar={props.comment.author?.twitterInfo?.avatarUrl}
                twitterHandle={props.comment.author?.twitterInfo?.handle}
              >
                <div className="text-xs text-neutral-900">{authorName}</div>
              </AuthorHovercard>
            ) : (
              <div className="text-xs text-neutral-900">{authorName}</div>
            )}
            <Link passHref href={url}>
              <a className="ml-4 text-xs text-neutral-500 hover:underline">
                {formatDistanceToNowStrict(props.comment.created)} ago
              </a>
            </Link>
          </header>
          <RichTextDocumentDisplay
            className="mt-2.5 text-sm"
            document={props.comment.document}
            excludeBlocks={[BlockNodeType.TwitterEmbed, BlockNodeType.Image]}
          />
          <Controls
            className="mt-4"
            commentId={props.comment.id}
            realm={props.realm}
            score={props.comment.score}
            userIsAdmin={props.userIsAdmin}
            userVote={props.comment.myVote}
            onDelete={props.onDelete}
            onReply={() => setReplyBoxOpen(true)}
          />
        </div>
      </div>
      {replyBoxOpen && (
        <div className="grid grid-cols-[32px,1fr] gap-x-3">
          <div className="relative">
            {(!!replies.length || !!props.comment.repliesCount) && (
              <div
                className={cx(
                  'absolute',
                  'border-l-[1px]',
                  'border-neutral-400',
                  'bottom-0',
                  'left-1/2',
                  'top-0',
                )}
              />
            )}
            <div className="absolute overflow-hidden h-4 w-5 left-1/2 top-0">
              <div
                className={cx(
                  'absolute',
                  'border-l-[1px]',
                  'border-b-[1px]',
                  'bottom-0',
                  'border-neutral-400',
                  'h-6',
                  'left-0',
                  'rounded-lg',
                  'w-8',
                )}
              />
            </div>
          </div>
          <div className="pb-4">
            <ReplyBox.Content
              autoFocus
              feedItemId={props.feedItemId}
              parentCommentId={props.comment.id}
              realm={props.realm}
              onClose={() => setReplyBoxOpen(false)}
              onSubmit={() => setReplyBoxOpen(false)}
            />
          </div>
        </div>
      )}
      {replies.filter(filterUniqueBy('id')).map((comment, i) => {
        const isLast = replies && i === replies.length - 1;

        return (
          <div className="grid grid-cols-[32px,1fr] gap-x-3" key={comment.id}>
            <div className="relative">
              {(!isLast ||
                originalRepliesCount !== props.comment.repliesCount) && (
                <div
                  className={cx(
                    'absolute',
                    'border-l-[1px]',
                    'border-neutral-400',
                    'bottom-0',
                    'left-1/2',
                    'top-0',
                  )}
                />
              )}
              <div className="absolute overflow-hidden h-4 w-5 left-1/2 top-0">
                <div
                  className={cx(
                    'absolute',
                    'border-l-[1px]',
                    'border-b-[1px]',
                    'bottom-0',
                    'border-neutral-400',
                    'h-6',
                    'left-0',
                    'rounded-lg',
                    'w-8',
                  )}
                />
              </div>
            </div>
            <div className={cx(!isLast && 'pb-8')}>
              <Content
                comment={comment}
                feedItemId={props.feedItemId}
                realm={props.realm}
                realmUrlId={props.realmUrlId}
              />
            </div>
          </div>
        );
      })}
      {originalRepliesCount !== props.comment.repliesCount && (
        <div className="grid grid-cols-[32px,1fr] gap-x-3">
          <div className="relative">
            <div className="absolute overflow-hidden h-6 w-4 left-1/2 top-0">
              <div
                className={cx(
                  'absolute',
                  'border-l-[1px]',
                  'border-b-[1px]',
                  'bottom-0',
                  'border-neutral-400',
                  'h-12',
                  'left-0',
                  'rounded-lg',
                  'w-12',
                )}
              />
            </div>
          </div>
          <div>
            <Link passHref href={url}>
              <a className="inline-block py-4 text-xs text-neutral-500 hover:text-sky-500">
                View replies
              </a>
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}

export function Error(props: BaseProps) {
  return (
    <div className={cx(props.className, 'w-full')}>
      <div className={cx('grid', 'grid-cols-[32px,1fr]', 'gap-x-3')}>
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-neutral-200" />
        </div>
        <div>
          <div className="flex items-center">
            <div className="text-xs rounded w-32">&nbsp;</div>
            <div className="text-xs rounded w-32 ml-4">&nbsp;</div>
          </div>
          <div className="mt-2.5 rounded h-24 max-w-[400px] bg-neutral-200" />
          <div className="mt-4 rounded w-64 bg-neutral-200">&nbsp;</div>
        </div>
      </div>
    </div>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div className={cx(props.className, 'w-full')}>
      <div className={cx('grid', 'grid-cols-[32px,1fr]', 'gap-x-3')}>
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center">
            <div className="text-xs rounded w-32 animate-pulse">&nbsp;</div>
            <div className="text-xs rounded w-32 ml-4 animate-pulse">
              &nbsp;
            </div>
          </div>
          <div className="mt-2.5 rounded h-24 max-w-[400px] bg-neutral-200 animate-pulse" />
          <div className="mt-4 rounded w-64 bg-neutral-200 animate-pulse">
            &nbsp;
          </div>
        </div>
      </div>
    </div>
  );
}
