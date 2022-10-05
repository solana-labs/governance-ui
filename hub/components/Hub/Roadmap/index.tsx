import ToolKit from '@carbon/icons-react/lib/ToolKit';

import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import cx from '@hub/lib/cx';
import { HubInfoRoadmapItemStatus } from '@hub/types/HubInfoRoadmapItemStatus';
import { RichTextDocument } from '@hub/types/RichTextDocument';

import { DashesSvg } from './DashesSvg';
import { Item } from './Item';
import { StartSvg } from './StartSvg';

interface Props {
  className?: string;
  description?: null | RichTextDocument;
  icon?: null | string;
  name: string;
  items: {
    date?: null | number;
    resource?: null | {
      content?: null | RichTextDocument;
      title: string;
      url: string;
    };
    status?: null | HubInfoRoadmapItemStatus;
    title: string;
  }[];
}

export function Roadmap(props: Props) {
  return (
    <article
      className={cx(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'px-4',
        props.className,
      )}
    >
      <div className="relative">
        <StartSvg className="fill-transparent stroke-neutral-900 w-[74px] h-[107px]" />
        {props.icon ? (
          <img
            className={cx(
              '-translate-x-1/2',
              'absolute',
              'h-14',
              'left-1/2',
              'rounded-full',
              'top-[9px]',
              'w-14',
            )}
            src={props.icon}
          />
        ) : (
          <div
            className={cx(
              '-translate-x-1/2',
              'absolute',
              'bg-black',
              'flex',
              'h-14',
              'items-center',
              'justify-center',
              'left-1/2',
              'rounded-full',
              'text-4xl',
              'text-white',
              'top-[9px]',
              'w-14',
            )}
          >
            {props.name[0]}
          </div>
        )}
      </div>
      <div className="text-4xl font-semibold my-1">
        The {props.name} Roadmap
      </div>
      {props.description && (
        <RichTextDocumentDisplay
          className="mt-2 mb-1 text-neutral-700 max-w-2xl text-center"
          document={props.description}
        />
      )}
      <div
        style={{
          WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1) 50%)`,
          maskImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1) 50%)`,
        }}
      >
        <DashesSvg className="h-[71px] w-[3px] stroke-neutral-900 fill-transparent" />
      </div>
      {props.items.map((item, i) => (
        <Item {...item} key={i} last={i >= props.items.length - 1} />
      ))}
      <div
        className="mt-1"
        style={{
          WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0))`,
          maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0))`,
        }}
      >
        <DashesSvg className="h-[71px] w-[3px] stroke-neutral-900 fill-transparent" />
      </div>
      <div className="mt-1 flex flex-col items-center">
        <ToolKit className="h-6 neutral-500 w-6" />
        <div className="text-xs text-neutral-700 mt-0.5">More to come</div>
      </div>
    </article>
  );
}
