import DocumentTasksIcon from '@carbon/icons-react/lib/DocumentTasks';
import * as Separator from '@radix-ui/react-separator';
import { PublicKey } from '@solana/web3.js';
import { TypeOf } from 'io-ts';
import { useEffect, useState } from 'react';
import { CombinedError } from 'urql';

import * as Button from '@hub/components/controls/Button';
import { RichTextEditor } from '@hub/components/controls/RichTextEditor';
import { Tooltip } from '@hub/components/controls/Tooltip';
import { RealmSelector } from '@hub/components/RealmSelector';
import { useMutation } from '@hub/hooks/useMutation';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import { isEmpty } from '@hub/lib/richText';
import * as RE from '@hub/types/Result';
import { RichTextDocument } from '@hub/types/RichTextDocument';

import * as gql from './gql';

type Post = TypeOf<typeof gql.createPostResp>['createPost'];

const MAX_NUM_CROSSPOSTS = 5;

interface Props {
  className?: string;
  realm: PublicKey;
  realmIconUrl?: string | null;
  realmName: string;
  onPostCreated?(post: Post, realm: PublicKey): void;
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
  const [realm, setRealm] = useState(props.realm);
  const [crosspostTo, setCrosspostTo] = useState<PublicKey[]>([]);

  useEffect(() => {
    if (realm.equals(ECOSYSTEM_PAGE)) {
      setCrosspostTo([]);
    }
  }, [realm]);

  return (
    <div
      className={cx(
        'bg-neutral-100',
        'grid',
        'grid-rows-[max-content,max-content,1fr,max-content]',
        'rounded',
        props.className,
      )}
    >
      <header
        className={cx(
          'border-b-neutral-200',
          'border-b',
          'flex-wrap',
          'flex',
          'gap-x-2',
          'items-center',
          'max-w-[80%]',
          'pb-4',
        )}
      >
        <div className="text-sm text-neutral-500 mr-1">Post in:</div>
        {props.realm.equals(ECOSYSTEM_PAGE) ? (
          <RealmSelector
            exclude={crosspostTo}
            defaultSelected={realm}
            onChange={(realm) => setRealm(realm.publicKey)}
          />
        ) : (
          <div className="flex items-center space-x-2 pl-2 pr-4 h-11">
            {props.realmIconUrl && (
              <img className="h-4 w-4 rounded-full" src={props.realmIconUrl} />
            )}
            <div className="text-sm text-zinc-500">{props.realmName}</div>
          </div>
        )}
        {!realm.equals(ECOSYSTEM_PAGE) &&
          crosspostTo.map((crosspostRealm, i) => (
            <RealmSelector
              removable
              defaultSelected={crosspostRealm}
              exclude={[realm, ECOSYSTEM_PAGE].concat(
                crosspostTo.filter((c) => !c.equals(crosspostRealm)),
              )}
              key={crosspostRealm.toBase58() + i}
              onChange={(realm) =>
                setCrosspostTo((currentList) => {
                  const newList = [...currentList];
                  const currentIndex = newList.findIndex((v) =>
                    v.equals(crosspostRealm),
                  );
                  newList[currentIndex] = realm.publicKey;
                  return newList;
                })
              }
              onRemove={() =>
                setCrosspostTo((currentList) => {
                  const newList = [...currentList];
                  const currentIndex = newList.findIndex((v) =>
                    v.equals(crosspostRealm),
                  );
                  newList.splice(currentIndex, 1);
                  return newList;
                })
              }
            />
          ))}
        {!realm.equals(ECOSYSTEM_PAGE) &&
          crosspostTo.length < MAX_NUM_CROSSPOSTS && (
            <RealmSelector
              key={crosspostTo.map((i) => i.toBase58()).join('-')}
              exclude={[realm, ECOSYSTEM_PAGE].concat(crosspostTo)}
              onChange={(realm) =>
                setCrosspostTo((currentList) => {
                  const newList = [...currentList];
                  newList.push(realm.publicKey);
                  return newList;
                })
              }
            />
          )}
      </header>
      <input
        autoFocus
        className={cx(
          'bg-transparent',
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
        <Separator.Root className="h-[1px] w-full bg-neutral-200 mt-4" />
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
                crosspostTo,
                document,
                title,
                realm: realm.toBase58(),
              });

              if (RE.isFailed(result)) {
                setError(result.error);
                setSubmitting(false);
              } else {
                props.onPostCreated?.(result.data.createPost, realm);
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
