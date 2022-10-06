import CheckmarkOutlineIcon from '@carbon/icons-react/lib/CheckmarkOutline';
import CrossroadsIcon from '@carbon/icons-react/lib/Crossroads';
import InProgressIcon from '@carbon/icons-react/lib/InProgress';
import LaunchIcon from '@carbon/icons-react/lib/Launch';
import WarningOtherIcon from '@carbon/icons-react/lib/WarningOther';
import { format } from 'date-fns';

import cx from '@hub/lib/cx';
import { HubInfoRoadmapItemStatus } from '@hub/types/HubInfoRoadmapItemStatus';
import { RichTextDocument } from '@hub/types/RichTextDocument';

import { CompletedSvg } from './CompletedSvg';
import { DashesSvg } from './DashesSvg';
import { NotCompletedSvg } from './NotCompletedSvg';

interface Props {
  className?: string;
  date?: null | number;
  last?: boolean;
  resource?: null | {
    content?: null | RichTextDocument;
    title: string;
    url: string;
  };
  status?: null | HubInfoRoadmapItemStatus;
  title: string;
}

export function Item(props: Props) {
  return (
    <section
      className={cx(
        'max-w-2xl',
        'pt-5',
        'w-full',
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        props.className,
      )}
    >
      <div
        className={cx(
          'bg-white',
          'flex-col',
          'flex',
          'items-center',
          'justify-center',
          'px-6',
          'py-5',
          'relative',
          'rounded',
          'w-full',
        )}
      >
        {props.status === HubInfoRoadmapItemStatus.Completed ? (
          <CompletedSvg
            className={cx(
              '-top-5',
              '-translate-x-1/2',
              'absolute',
              'fill-emerald-500',
              'h-8',
              'left-1/2',
              'w-8',
            )}
          />
        ) : props.status === HubInfoRoadmapItemStatus.InProgress ||
          props.status === HubInfoRoadmapItemStatus.Delayed ? (
          <NotCompletedSvg
            className={cx(
              '-top-5',
              '-translate-x-1/2',
              'absolute',
              'fill-neutral-900',
              'h-8',
              'left-1/2',
              'w-8',
            )}
          />
        ) : (
          <NotCompletedSvg
            className={cx(
              '-top-5',
              '-translate-x-1/2',
              'absolute',
              'fill-neutral-500',
              'h-8',
              'left-1/2',
              'w-8',
            )}
          />
        )}
        <div className="text-2xl font-semibold text-netural-900">
          {props.title}
        </div>
        {props.date && (
          <div className="mt-1 text-xs text-neutral-700">
            {format(props.date, 'MMMM yyyy')}
          </div>
        )}
        {props.status === HubInfoRoadmapItemStatus.Completed ? (
          <div className="py-1.5 px-3 rounded bg-neutral-100 flex items-center mt-2">
            <CheckmarkOutlineIcon className="fill-emerald-600" />
            <div className="ml-1 text-xs text-emerald-600">Completed</div>
          </div>
        ) : props.status === HubInfoRoadmapItemStatus.Delayed ? (
          <div className="py-1.5 px-3 rounded bg-neutral-100 flex items-center mt-2">
            <WarningOtherIcon className="fill-rose-500" />
            <div className="ml-1 text-xs text-rose-500">Delayed</div>
          </div>
        ) : props.status === HubInfoRoadmapItemStatus.InProgress ? (
          <div className="py-1.5 px-3 rounded bg-neutral-100 flex items-center mt-2">
            <InProgressIcon className="fill-neutral-700" />
            <div className="ml-1 text-xs text-neutral-700">In progress</div>
          </div>
        ) : (
          <div className="py-1.5 px-3 rounded bg-neutral-100 flex items-center mt-2">
            <CrossroadsIcon className="fill-neutral-700" />
            <div className="ml-1 text-xs text-neutral-700">Upcoming</div>
          </div>
        )}
      </div>
      {props.resource && (
        <a
          className={cx(
            'bg-white',
            'flex',
            'items-center',
            'justify-center',
            'mt-0.5',
            'py-3',
            'rounded',
            'w-full',
          )}
          href={props.resource.url}
          target="_blank"
          rel="noreferrer"
        >
          <div className="text-sm font-bold text-sky-600">
            {props.resource.title}
          </div>
          <LaunchIcon className="h-4 w-4 ml-2 fill-neutral-500" />
        </a>
      )}
      {!props.last && (
        <DashesSvg
          className={cx(
            'fill-transparent',
            'h-[71px]',
            'mt-1',
            'stroke-neutral-900',
            'w-[3px]',
          )}
        />
      )}
    </section>
  );
}
