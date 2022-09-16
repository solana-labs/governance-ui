import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';
import { useState } from 'react';

import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import * as Button from '@hub/components/controls/Button';
import { RichTextEditor } from '@hub/components/controls/RichTextEditor';
import { useMutation } from '@hub/hooks/useMutation';
import { useQuery } from '@hub/hooks/useQuery';
import { useToast, ToastType } from '@hub/hooks/useToast';
import cx from '@hub/lib/cx';
import { isEmpty } from '@hub/lib/richText';
import { useUserCreatedFeedItemCommentRepliesStore } from '@hub/stores/userCreatedFeedItemCommentReplies';
import { useUserCreatedTopLevelFeedItemRepliesStore } from '@hub/stores/userCreatedTopLevelFeedItemRepliesStore';
import * as RE from '@hub/types/Result';
import { RichTextDocument } from '@hub/types/RichTextDocument';

import * as gql from './gql';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  feedItemId: string;
  parentCommentId?: string;
  realm: PublicKey;
  onClose?(): void;
  onSubmit?(document: RichTextDocument): void;
}

export function Content(props: Props) {
  const [, createComment] = useMutation(
    gql.createCommentResp,
    gql.createComment,
  );
  const [documentKey, setDocumentKey] = useState(0);
  const [meResult] = useQuery(gql.getUserResp, { query: gql.getUser });
  const [
    richTextDocument,
    setRichTextDocument,
  ] = useState<RichTextDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { publish } = useToast();
  const addTopLevelComment = useUserCreatedTopLevelFeedItemRepliesStore(
    (state) => state.addComment,
  );
  const addCommentReply = useUserCreatedFeedItemCommentRepliesStore(
    (state) => state.addReply,
  );

  const disabled = !richTextDocument || isEmpty(richTextDocument);

  return (
    <div
      className={cx(props.className, 'grid', 'grid-cols-[32px,1fr]', 'gap-x-3')}
    >
      <div>
        {pipe(
          meResult,
          RE.match(
            () => (
              <div className="rounded-full w-8 h-8 bg-neutral-200 animate-pulse" />
            ),
            () => <AuthorAvatar className="h-8 w-8" />,
            ({ me }) => <AuthorAvatar className="h-8 w-8" author={me} />,
          ),
        )}
      </div>
      <div className="flex flex-col items-end">
        <div className="bg-zinc-50 border border-zinc-300 rounded min-h-[80px] w-full py-2 px-3">
          <RichTextEditor
            placeholder="Add a comment"
            key={documentKey}
            onChange={setRichTextDocument}
          />
        </div>
        <div className="flex items-center justify-end mt-2 space-x-2">
          {props.onClose && (
            <Button.Secondary className="w-48" onClick={props.onClose}>
              Cancel
            </Button.Secondary>
          )}
          <Button.Primary
            className="w-48"
            disabled={disabled}
            pending={submitting}
            onClick={async (e) => {
              e.stopPropagation();
              const document = richTextDocument;

              if (disabled || !document) {
                return;
              }

              setSubmitting(true);
              const result = await createComment({
                document,
                feedItemId: props.feedItemId,
                parentCommentId: props.parentCommentId,
                realm: props.realm,
              });

              setSubmitting(false);

              if (RE.isOk(result) || RE.isStale(result)) {
                setRichTextDocument(() => null);
                setDocumentKey((key) => key + 1);
                props.onSubmit?.(document);

                if (props.parentCommentId) {
                  addCommentReply(
                    props.parentCommentId,
                    result.data.createFeedItemComment,
                  );
                } else {
                  addTopLevelComment(
                    props.feedItemId,
                    result.data.createFeedItemComment,
                  );
                }
              } else {
                publish({
                  type: ToastType.Error,
                  title: 'Could not add a reply',
                  message: result.error.message,
                });
              }
            }}
          >
            Comment
          </Button.Primary>
        </div>
      </div>
    </div>
  );
}

export function Error(props: BaseProps) {
  return (
    <div
      className={cx(props.className, 'grid', 'grid-cols-[32px,1fr]', 'gap-x-3')}
    >
      <div>
        <div className="rounded-full w-8 h-8 bg-neutral-200" />
      </div>
      <div className="flex flex-col items-end">
        <div className="rounded bg-neutral-200 h-20 w-full" />
        <div className="rounded bg-neutral-200 h-10 w-48 mt-2" />
      </div>
    </div>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div
      className={cx(props.className, 'grid', 'grid-cols-[32px,1fr]', 'gap-x-3')}
    >
      <div>
        <div className="rounded-full w-8 h-8 bg-neutral-200 animate-pulse" />
      </div>
      <div className="flex flex-col items-end">
        <div className="rounded bg-neutral-200 h-20 w-full animate-pulse" />
        <div className="rounded bg-neutral-200 h-10 w-48 mt-2 animate-pulse" />
      </div>
    </div>
  );
}
