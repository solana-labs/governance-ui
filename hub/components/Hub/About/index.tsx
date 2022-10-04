import AddIcon from '@carbon/icons-react/lib/Add';
import { useState } from 'react';

import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import cx from '@hub/lib/cx';
import { RichTextDocument } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  sections: {
    content: RichTextDocument;
    heading?: null | string;
  }[];
}

export function About(props: Props) {
  const [expanded, setExpanded] = useState(false);

  const sections = expanded ? props.sections : props.sections.slice(0, 3);

  return (
    <article className={cx('space-y-10', props.className)}>
      {sections.map((section, i) => (
        <section className="space-y-3" key={i}>
          {section.heading && (
            <header className="text-lg font-medium text-neutral-900">
              {section.heading}
            </header>
          )}
          <RichTextDocumentDisplay
            className="text-base text-neutral-700 leading-7"
            document={section.content}
          />
        </section>
      ))}
      {sections.length < props.sections.length && (
        <button
          className={cx(
            'bg-white',
            'flex',
            'h-10',
            'items-center',
            'justify-center',
            'mt-8',
            'rounded',
            'space-x-1.5',
            'text-neutral-900',
            'transition-colors',
            'w-44',
            'hover:bg-neutral-200',
          )}
          onClick={() => setExpanded(true)}
        >
          <AddIcon className="h-4 w-4 fill-current" />
          <div className="text-sm">Read more</div>
        </button>
      )}
    </article>
  );
}
