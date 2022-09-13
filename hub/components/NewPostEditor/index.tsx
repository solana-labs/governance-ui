import DocumentTasksIcon from '@carbon/icons-react/lib/DocumentTasks';
import * as Separator from '@radix-ui/react-separator';
import { PublicKey } from '@solana/web3.js';
import { TypeOf } from 'io-ts';
import { useState } from 'react';
import { CombinedError } from 'urql';

import * as Button from '@hub/components/controls/Button';
import { RichTextEditor } from '@hub/components/controls/RichTextEditor';
import { useMutation } from '@hub/hooks/useMutation';
import cx from '@hub/lib/cx';
import { isEmpty } from '@hub/lib/richText';
import * as RE from '@hub/types/Result';
import { RichTextDocument } from '@hub/types/RichTextDocument';

import * as gql from './gql';

type Post = TypeOf<typeof gql.createPostResp>['createPost'];

interface Props {
  className?: string;
  realm: PublicKey;
  realmIconUrl?: string | null;
  realmName: string;
  onPostCreated?(post: Post): void;
}

export function NewPostEditor(props: Props) {
  const [document, setDocument] = useState<RichTextDocument>({
    attachments: [],
    content: [],
  });
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [, createPost] = useMutation(gql.createPostResp, gql.createPost);
  const [error, setError] = useState<CombinedError | null>(null);

  return (
    <div
      className={cx(
        props.className,
        'grid',
        'grid-rows-[max-content,max-content,1fr,max-content]',
      )}
    >
      <header className="flex items-center space-x-2">
        {props.realmIconUrl && (
          <img className="h-8 w-8 rounded-full" src={props.realmIconUrl} />
        )}
        <div className="text-sm text-zinc-500">{props.realmName}</div>
      </header>
      <input
        autoFocus
        className={cx(
          'font-bold',
          'mt-20',
          'outline-none',
          'text-4xl',
          'text-zinc-900',
          'w-full',
          'placeholder:text-neutral-300',
        )}
        placeholder="Add a title"
        value={title}
        onChange={(e) => {
          setTitle(e.currentTarget.value);
        }}
      />
      <div className="overflow-y-auto">
        <RichTextEditor
          className="mt-12"
          placeholder="Start typing your post"
          onChange={setDocument}
        />
      </div>
      <footer>
        <Separator.Root className="h-[1px] w-full bg-neutral-100 mt-4" />
        <div className="flex items-center justify-end pt-8">
          <Button.Primary
            className="w-32"
            disabled={!title || isEmpty(document)}
            pending={submitting}
            onClick={async () => {
              if (!title || isEmpty(document)) {
                return;
              }

              setError(null);
              setSubmitting(true);

              const result = await createPost({
                document,
                title,
                realm: props.realm.toBase58(),
              });

              if (RE.isFailed(result)) {
                setError(result.error);
                setSubmitting(false);
              } else {
                props.onPostCreated?.(result.data.createPost);
              }
            }}
          >
            <DocumentTasksIcon className="w-4 h-4 mr-2" />
            Publish
          </Button.Primary>
        </div>
        {error && (
          <div className="text-xs text-rose-500 pt-4">{error.message}</div>
        )}
      </footer>
    </div>
  );
}
