import EarthIcon from '@carbon/icons-react/lib/Earth';
// import EventsIcon from '@carbon/icons-react/lib/Events';
import IdeaIcon from '@carbon/icons-react/lib/Idea';
import LogoTwitterIcon from '@carbon/icons-react/lib/LogoTwitter';
import { useState } from 'react';

import cx from '@hub/lib/cx';
// import { formatNumber } from '@hub/lib/formatNumber';
// import { ntext } from '@hub/lib/ntext';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  description?: string | null;
  membersCount: number;
  twitterHandle?: string | null;
  websiteUrl?: string | null;
}

export function Content(props: Props) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const description =
    (descriptionExpanded
      ? props.description
      : props.description?.slice(0, 300)) || 'No description available';
  const willClip = (props.description?.length || 0) > 300;

  return (
    <section className={props.className}>
      <header className="flex items-center space-x-2 text-neutral-500 text-xs">
        <IdeaIcon className="h-4 w-4 fill-current" />
        <div>ABOUT</div>
      </header>
      <div className="mt-4 text-neutral-700 text-sm">
        {description}
        {!descriptionExpanded && willClip && (
          <button
            className={cx(
              'text-neutral-900',
              'text-sm',
              'transition-colors',
              'hover:text-neutral-400',
            )}
            onClick={() => setDescriptionExpanded(true)}
          >
            &nbsp;&#8230;More
          </button>
        )}
      </div>
      {/* <div className="flex items-center space-x-2 mt-3">
        <EventsIcon className="h-4 w-4 fill-neutral-500" />
        <div className="text-sm text-neutral-700">
          {formatNumber(props.membersCount, undefined, {})}{' '}
          {ntext(props.membersCount, 'member')}
        </div>
      </div> */}
      {props.websiteUrl && (
        <a
          className="flex group items-center space-x-2 mt-3"
          href={props.websiteUrl}
          target="_blank"
          rel="noreferrer"
        >
          <EarthIcon className="h-4 w-4 fill-cyan-500 flex-shrink-0" />
          <div
            className={cx(
              'text-sm',
              'text-neutral-900',
              'truncate',
              'transition-colors',
              'group-hover:text-cyan-500',
            )}
          >
            {props.websiteUrl}
          </div>
        </a>
      )}
      {props.twitterHandle && (
        <a
          className="flex group items-center space-x-2 mt-3"
          href={`https://twitter.com/${props.twitterHandle}`}
          target="_blank"
          rel="noreferrer"
        >
          <LogoTwitterIcon className="h-4 w-4 fill-[#55ACEE] flex-shrink-0" />
          <div
            className={cx(
              'text-sm',
              'text-neutral-900',
              'truncate',
              'transition-colors',
              'group-hover:text-[#55ACEE]',
            )}
          >
            {props.twitterHandle}
          </div>
        </a>
      )}
    </section>
  );
}

export function Loading(props: BaseProps) {
  return (
    <section className={props.className}>
      <header className="text-xs w-20 bg-neutral-200 animate-pulse rounded">
        &nbsp;
      </header>
      <div className="mt-4 bg-neutral-200 animate-pulse rounded w-full h-20" />
    </section>
  );
}

export function Error(props: BaseProps) {
  return (
    <section className={props.className}>
      <header className="text-xs w-20 bg-neutral-200 rounded">&nbsp;</header>
      <div className="mt-4 bg-neutral-200 rounded w-full h-20" />
    </section>
  );
}
