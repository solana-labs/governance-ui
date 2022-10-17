import AddIcon from '@carbon/icons-react/lib/Add';
import * as Accordion from '@radix-ui/react-accordion';
import { useState } from 'react';

import { Faq as FaqIcon } from '@hub/components/icons/Faq';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import cx from '@hub/lib/cx';
import { RichTextDocument } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  items: {
    answer: RichTextDocument;
    clippedAnswer: {
      document: RichTextDocument;
      isClipped: boolean;
    };
    question: string;
  }[];
}

export function Faq(props: Props) {
  const [open, setOpen] = useState<string[]>([]);

  return (
    <article
      className={cx('p-16', 'pb-8', 'rounded', 'bg-white', props.className)}
    >
      <div className="flex items-center justify-center mb-10">
        <FaqIcon className="h-8 fill-neutral-300 w-8" />
        <div className="text-4xl text-neutral-900 font-semibold ml-5">
          Frequently Asked Questions
        </div>
      </div>
      <Accordion.Root type="multiple" value={open} onValueChange={setOpen}>
        {props.items.map((item, i) => {
          const isOpen = open.includes(String(i));

          return (
            <Accordion.Item
              className={cx(
                'py-8',
                i < props.items.length - 1 && 'border-b border-neutral-400',
              )}
              key={i}
              value={String(i)}
            >
              <Accordion.Trigger
                className={cx(
                  'gap-x-2',
                  'grid-cols-[1fr,32px]',
                  'grid',
                  'items-center',
                  'text-left',
                  'tracking-normal',
                  'w-full',
                  !item.clippedAnswer.isClipped && 'cursor-default',
                )}
              >
                <Accordion.Header className="text-2xl font-medium text-neutral-900">
                  {item.question}
                </Accordion.Header>
                {item.clippedAnswer.isClipped && (
                  <AddIcon
                    className={cx(
                      'h-8',
                      'transition-all',
                      'w-8',
                      isOpen && 'fill-sky-600',
                      isOpen && 'rotate-45',
                    )}
                  />
                )}
              </Accordion.Trigger>
              <div className="mt-1 text-neutral-700">
                {isOpen ? (
                  <Accordion.Content>
                    <RichTextDocumentDisplay document={item.answer} />
                  </Accordion.Content>
                ) : (
                  <RichTextDocumentDisplay
                    document={item.clippedAnswer.document}
                    isClipped={item.clippedAnswer.isClipped}
                  />
                )}
              </div>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </article>
  );
}
