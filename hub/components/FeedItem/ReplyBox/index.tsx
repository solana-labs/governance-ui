import { pipe } from 'fp-ts/function';
import { useState } from 'react';

import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import * as Button from '@hub/components/controls/Button';
import { RichTextEditor } from '@hub/components/controls/RichTextEditor';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import { isEmpty } from '@hub/lib/richText';
import * as RE from '@hub/types/Result';
import { RichTextDocument } from '@hub/types/RichTextDocument';

import * as gql from './gql';

interface Props {
  className?: string;
  onSubmit?(document: RichTextDocument): void;
}

export function Content(props: Props) {
  const [result] = useQuery(gql.getUserResp, { query: gql.getUser });
  const [
    richTextDocument,
    setRichTextDocument,
  ] = useState<RichTextDocument | null>(null);

  return (
    <div
      className={cx(props.className, 'grid', 'grid-cols-[32px,1fr]', 'gap-x-3')}
    >
      <div>
        {pipe(
          result,
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
            onChange={setRichTextDocument}
          />
        </div>
        <Button.Primary
          className="mt-2 w-48"
          disabled={!richTextDocument || isEmpty(richTextDocument)}
        >
          Comment
        </Button.Primary>
      </div>
    </div>
  );
}

export function Error(props: Props) {
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

export function Loading(props: Props) {
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
