import ArrowLeftIcon from '@carbon/icons-react/lib/ArrowLeft';
import Link from 'next/link';

import cx from '@hub/lib/cx';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  feedItemId: string;
  realmUrlId: string;
}

export function Content(props: Props) {
  return (
    <Link passHref href={`/realm/${props.realmUrlId}/${props.feedItemId}`}>
      <a
        className={cx(
          props.className,
          'inline-flex',
          'group',
          'items-center',
          'space-x-2',
        )}
      >
        <ArrowLeftIcon className="h-4 w-4 fill-neutral-700 transition-colors group-hover:fill-sky-500" />
        <div className="text-neutral-700 text-xs transition-colors group-hover:text-sky-500">
          View all comments
        </div>
      </a>
    </Link>
  );
}

export function Error(props: BaseProps) {
  return (
    <div
      className={cx(
        props.className,
        'bg-neutral-200',
        'rounded',
        'text-xs',
        'w-64',
      )}
    >
      &nbsp;
    </div>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div
      className={cx(
        props.className,
        'animate-pulse',
        'bg-neutral-200',
        'rounded',
        'text-xs',
        'w-64',
      )}
    >
      &nbsp;
    </div>
  );
}
