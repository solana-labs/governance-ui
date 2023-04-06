import Link from 'next/link';
import { useRouter } from 'next/router';

import { Post as PostModel } from '../gql';
import { RealmIcon } from '@hub/components/RealmIcon';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  post: PostModel;
}

export function Post(props: Props) {
  const router = useRouter();

  return (
    <button
      className={cx(
        'text-left',
        'w-full',
        'overflow-hidden',
        'tracking-normal',
        props.className,
      )}
      onClick={() => {
        router.push(`/realm/${props.post.realm.urlId}/${props.post.id}`);
      }}
    >
      <Link passHref href={`/realm/${props.post.realm.urlId}/${props.post.id}`}>
        <a
          className={cx(
            'block',
            'font-bold',
            'text-neutral-900',
            'text-sm',
            'transition-colors',
            'truncate',
            'hover:text-sky-500',
          )}
        >
          {props.post.title}
        </a>
      </Link>
      <RichTextDocumentDisplay
        className="text-sm text-neutral-500"
        document={props.post.clippedDocument.document}
        isClipped={props.post.clippedDocument.isClipped}
      />
      <div className="flex items-center mt-1.5">
        <RealmIcon
          className="h-4 mr-1 w-4"
          iconUrl={props.post.realm.iconUrl}
          name={props.post.realm.name}
        />
        <div className="text-xs font-medium text-neutral-900">
          {props.post.realm.publicKey.equals(ECOSYSTEM_PAGE)
            ? 'Solana Ecosystem'
            : props.post.realm.name}
        </div>
      </div>
    </button>
  );
}
