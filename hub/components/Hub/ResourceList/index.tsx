import LaunchIcon from '@carbon/icons-react/lib/Launch';
import LinkIcon from '@carbon/icons-react/lib/Link';

import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import cx from '@hub/lib/cx';
import { RichTextDocument } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  resources: {
    content?: null | RichTextDocument;
    title: string;
    url: string;
  }[];
}

export function ResourceList(props: Props) {
  return (
    <article className={props.className}>
      <header className="flex items-center text-neutral-500">
        <LinkIcon className="fill-current h-4 w-4" />
        <div className="uppercase text-xs font-semibold ml-1">
          more resources
        </div>
      </header>
      <div className="mt-7 space-y-8">
        {props.resources.map((resource, i) => {
          const parts = resource.url.split('/');
          const domain = parts
            .find((part) => {
              if (part.startsWith('http')) {
                return false;
              }

              if (part.startsWith(':')) {
                return false;
              }

              if (!part.length) {
                return false;
              }

              return true;
            })
            ?.replace('www', '');

          return (
            <a
              className="pl-4 border-l border-neutral-300 block cursor-pointer"
              href={resource.url}
              key={i}
              target="_blank"
              rel="noreferrer"
            >
              <div className="text-sm text-neutral-700 mb-1">{domain}</div>
              <div className="flex items-center">
                <div className="font-bold text-sky-600">{resource.title}</div>
                <LaunchIcon className="h-4 fill-neutral-500 ml-3 w-4" />
              </div>
              {resource.content && (
                <RichTextDocumentDisplay
                  className="mt-1 text-sm text-neutral-500"
                  document={resource.content}
                />
              )}
            </a>
          );
        })}
      </div>
    </article>
  );
}
