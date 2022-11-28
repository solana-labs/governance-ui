import { produce } from 'immer';
import { useState } from 'react';

import { FieldHeader } from '../common/FieldHeader';
import { FieldRichTextEditor } from '../common/FieldRichTextEditor';
import { SecondaryRed } from '@hub/components/controls/Button';
import { Input } from '@hub/components/controls/Input';
import { FaqOutline as FaqIcon } from '@hub/components/icons/FaqOutline';
import { isEmpty } from '@hub/lib/richText';
import { RichTextDocument } from '@hub/types/RichTextDocument';

function trimFAQ(
  faq: {
    __typename?: string;
    answer: RichTextDocument;
    clippedAnswer?: any;
    question: string;
  }[],
): {
  answer: RichTextDocument;
  question: string;
}[] {
  return faq
    .filter((item) => {
      return (!!item.answer && !isEmpty(item.answer)) || !!item.question;
    })
    .map((item) => {
      const { __typename, clippedAnswer, ...rest } = item;
      return rest;
    });
}

interface Props {
  className?: string;
  faq: {
    answer: RichTextDocument;
    question: string;
  }[];
  onFaqChange?(
    faq: {
      answer: RichTextDocument;
      question: string;
    }[],
  ): void;
}

export function FAQ(props: Props) {
  const [keyCounter, setKeyCounter] = useState(0);
  const items = (props.faq.length
    ? [...props.faq]
    : [
        {
          answer: {
            attachments: [],
            content: [],
          },
          question: '',
        },
      ]
  ).concat({
    answer: {
      attachments: [],
      content: [],
    },
    question: '',
  });

  return (
    <section className={props.className}>
      <header className="flex items-center space-x-2">
        <FaqIcon className="h-4 w-4 sm:h-6 sm:w-6 fill-sky-500" />
        <div className="text-xl sm:text-3xl font-medium text-neutral-900">
          Add Frequently Asked Questions
        </div>
      </header>
      <div className="mt-16 space-y-16">
        {items.map((item, i) => (
          <div key={String(keyCounter) + i}>
            <div className="flex items-center justify-between mb-2">
              <h1 className="my-0 text-xl sm:text-2xl text-sky-500 font-medium leading-[40px]">
                FAQ {i + 1}
              </h1>
              <SecondaryRed
                disabled={
                  (!item.answer || isEmpty(item.answer)) && !item.answer
                }
                onClick={() => {
                  const newItems = items.filter((t, index) => index !== i);
                  props.onFaqChange?.(trimFAQ(newItems));
                  setKeyCounter((key) => key + 1);
                }}
              >
                Delete FAQ
              </SecondaryRed>
            </div>
            <FieldHeader className="mb-1 mt-8">Question</FieldHeader>
            <Input
              className="w-full"
              placeholder="e.g. How do I…"
              value={item.question}
              onChange={(e) => {
                const value = e.currentTarget.value;
                const newItems = produce(items, (draft) => {
                  draft[i].question = value;
                });
                props.onFaqChange?.(trimFAQ(newItems));
              }}
            />
            <FieldHeader className="mb-1 mt-8">Answer</FieldHeader>
            <FieldRichTextEditor
              document={item.answer}
              placeholder="e.g. The best way to…"
              onDocumentChange={(document) => {
                const value = document || {
                  attachments: [],
                  content: [],
                };
                const newItems = produce(items, (draft) => {
                  draft[i].answer = value;
                });
                props.onFaqChange?.(trimFAQ(newItems));
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
