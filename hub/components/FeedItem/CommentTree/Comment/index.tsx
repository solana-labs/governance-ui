import type { PublicKey } from '@solana/web3.js';
import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';

import { FeedItemComment } from '../../gql';
import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

import { Controls } from './Controls';

interface Props {
  className?: string;
  comment: FeedItemComment;
  realm: PublicKey;
}

export function Comment(props: Props) {
  const authorName = props.comment.author
    ? props.comment.author.twitterInfo?.handle ||
      abbreviateAddress(props.comment.author.publicKey)
    : 'unknown author';

  return (
    <article className={cx(props.className, 'w-full')}>
      <div className={cx('grid', 'grid-cols-[32px,1fr]', 'gap-x-3')}>
        <div className="relative">
          <AuthorAvatar author={props.comment.author} className="h-8 w-8" />
          {(!!props.comment.replies?.length ||
            !!props.comment.repliesCount) && (
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
            !!props.comment.replies?.length && 'pb-8',
          )}
        >
          <header className="flex items-center">
            <div className="text-xs text-neutral-900">{authorName}</div>
            <div className="ml-4 text-xs text-neutral-500">
              {formatDistanceToNowStrict(props.comment.created)} ago
            </div>
          </header>
          <RichTextDocumentDisplay
            className="mt-2.5"
            document={props.comment.document}
          />
          <Controls
            className="mt-4"
            commentId={props.comment.id}
            realm={props.realm}
            score={props.comment.score}
            userVote={props.comment.myVote}
          />
        </div>
      </div>
      {!!props.comment.replies?.length &&
        props.comment.replies.map((comment, i) => {
          const isLast =
            props.comment.replies?.length &&
            i === props.comment.replies.length - 1;

          return (
            <div className="grid grid-cols-[32px,1fr]" key={comment.id}>
              <div className="relative">
                {!isLast && (
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
                <div className="absolute overflow-hidden h-4 w-4 left-1/2 top-0">
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
                      'w-6',
                    )}
                  />
                </div>
              </div>
              <div className={cx(!isLast && 'pb-8')}>
                <Comment comment={comment} realm={props.realm} />
              </div>
            </div>
          );
        })}
      {!props.comment.replies && !!props.comment.repliesCount && (
        <div className="grid grid-cols-[32px,1fr]">
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
            <button className="p-4 text-xs text-neutral-500 hover:text-cyan-500">
              View replies
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
