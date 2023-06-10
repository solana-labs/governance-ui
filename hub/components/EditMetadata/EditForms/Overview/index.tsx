import LinkIcon from '@carbon/icons-react/lib/Link';
// @ts-ignore
import DicomOverlayIcon from '@carbon/icons-react/lib/watson-health/DicomOverlay';
import * as Separator from '@radix-ui/react-separator';
import { produce } from 'immer';
import { useState } from 'react';

import { FieldDescription } from '../common/FieldDescription';
import { FieldHeader } from '../common/FieldHeader';
import { FieldRichTextEditor } from '../common/FieldRichTextEditor';
import { SecondaryRed } from '@components/core/controls/Button';
import { Input } from '@hub/components/controls/Input';
import { Textarea } from '@hub/components/controls/Textarea';
import cx from '@hub/lib/cx';
import { isEmpty, fromPlainText, toPlainText } from '@hub/lib/richText';
import { RichTextDocument } from '@hub/types/RichTextDocument';

function trimAbout(
  about: {
    __typename?: string;
    content: RichTextDocument;
    heading: null | string;
  }[],
): {
  content: RichTextDocument;
  heading: null | string;
}[] {
  return about
    .filter((a) => {
      return !isEmpty(a.content) || !!a.heading;
    })
    .map((a) => {
      // eslint-disable-next-line
      const { __typename, ...rest } = a;
      return rest;
    });
}

function trimResources(
  resources: {
    __typename?: string;
    content: null | RichTextDocument;
    title: string;
    url: string;
  }[],
): {
  content: null | RichTextDocument;
  title: string;
  url: string;
}[] {
  return resources
    .filter((r) => {
      return !!r.url || !!r.title;
    })
    .map((r) => {
      // eslint-disable-next-line
      const { __typename, ...rest } = r;
      return {
        ...rest,
        title: rest.title
          ? rest.title
          : rest.url.slice(0, 50) + (rest.url.length > 50 ? '…' : ''),
      };
    });
}

interface Props {
  className?: string;
  about: {
    content: RichTextDocument;
    heading: null | string;
  }[];
  heading: null | RichTextDocument;
  resources: {
    content: null | RichTextDocument;
    title: string;
    url: string;
  }[];
  onAboutChange?(
    about: {
      content: RichTextDocument;
      heading: null | string;
    }[],
  ): void;
  onHeadingChange?(heading: null | RichTextDocument): void;
  onResourcesChange?(
    resources: {
      content: null | RichTextDocument;
      title: string;
      url: string;
    }[],
  ): void;
}

export function Overview(props: Props) {
  const [keyCounter, setKeyCounter] = useState(0);

  const about = (props.about.length
    ? [...props.about]
    : [
        {
          content: {
            attachments: [],
            content: [],
          },
          heading: 'Introduction',
        },
      ]
  ).concat(
    props.about.length < 8
      ? {
          content: {
            attachments: [],
            content: [],
          },
          heading: null,
        }
      : [],
  );

  const resources = [
    props.resources[0] || {
      content: null,
      title: '',
      url: '',
    },
    props.resources[1] || {
      content: null,
      title: '',
      url: '',
    },
    props.resources[2] || {
      content: null,
      title: '',
      url: '',
    },
  ] as {
    content: null | RichTextDocument;
    title: string;
    url: string;
  }[];

  const headingText = props.heading ? toPlainText(props.heading) : '';
  const headingIsTooLong = headingText.length > 130;

  return (
    <section className={props.className}>
      <header className="flex items-center space-x-2 mb-16">
        <DicomOverlayIcon className="h-4 w-4 sm:h-6 sm:w-6 fill-sky-500" />
        <div className="text-xl sm:text-3xl font-medium text-neutral-900">
          Overview & Resources
        </div>
      </header>
      <div>
        <FieldHeader className="mb-1">Overview Statement</FieldHeader>
        <FieldDescription>
          This will display in large text, prominently displayed on your Hub
          page.
        </FieldDescription>
        <Textarea
          className="mt-1 h-20 w-full"
          placeholder="e.g. Our mission is to..."
          value={headingText}
          onChange={(e) => {
            const value = e.currentTarget.value;

            if (value) {
              props.onHeadingChange?.(fromPlainText(value));
            } else {
              props.onHeadingChange?.(null);
            }
          }}
        />
        <div className="flex items-center justify-end">
          <div
            className={cx(
              'text-xs',
              headingIsTooLong ? 'text-rose-500' : 'text-neutral-500',
            )}
          >
            {headingText.length} / 130
          </div>
        </div>
      </div>
      <div className="mt-16">
        <div className="text-xl sm:text-2xl font-medium text-sky-500 mb-2">
          About Your Organization
        </div>
        <FieldDescription>
          You can add a few paragraphs to explain your organization or project
          in detail. Group your paragraphs into sections to make it easier to
          understand.
        </FieldDescription>
        <div className="mt-8 space-y-16">
          {about.map((section, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="my-0 text-lg text-neutral-500 font-medium leading-[40px]">
                  Section {i + 1}
                </h2>
                {i !== 0 && (
                  <SecondaryRed
                    disabled={!section.heading && isEmpty(section.content)}
                    onClick={() => {
                      const newAbout = about.filter((a, index) => index !== i);
                      props.onAboutChange?.(trimAbout(newAbout));
                      setKeyCounter((key) => key + 1);
                    }}
                  >
                    Delete Section {i + 1}
                  </SecondaryRed>
                )}
              </div>
              <FieldHeader className="mb-1">Title</FieldHeader>
              <Input
                className="w-full"
                value={section.heading || ''}
                placeholder="e.g. About our future"
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  const newAbout = produce(about, (draft) => {
                    draft[i].heading = value;
                  });
                  props.onAboutChange?.(trimAbout(newAbout));
                }}
              />
              <FieldHeader className="mb-1 mt-8">Content</FieldHeader>
              <FieldDescription className="mb-1">
                {i === 0
                  ? 'Help viewers learn more about your vision, goals, and who you are as an organization'
                  : 'Additional sections add color and detail'}
              </FieldDescription>
              <FieldRichTextEditor
                document={section.content}
                key={String(keyCounter) + i}
                placeholder="e.g. This organization is..."
                onDocumentChange={(document) => {
                  const newAbout = produce(about, (draft) => {
                    draft[i].content = document || {
                      attachments: [],
                      content: [],
                    };
                  });
                  props.onAboutChange?.(trimAbout(newAbout));
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <Separator.Root className="w-full h-[1px] bg-neutral-300 my-16" />
      <header className="flex items-center space-x-2">
        <LinkIcon className="h-4 w-4 sm:h-6 sm:w-6 fill-sky-500" />
        <div className="text-xl sm:text-3xl font-medium text-neutral-900">
          Resources
        </div>
      </header>
      <FieldDescription className="mt-2">
        3rd-party articles, essays, and videos can be helpful to new users
        trying to understand your organization. You may list up to three URLs.
      </FieldDescription>
      <div className="mt-12 space-y-8">
        {resources.map((resource, i) => (
          <div key={i}>
            <h2 className="my-0 text-lg text-neutral-500 font-medium leading-[40px] mb-2">
              Resource {i + 1}
            </h2>
            <FieldHeader className="mb-1">Title</FieldHeader>
            <Input
              className="w-full"
              value={resource.title}
              placeholder="e.g. Hundreds said to have opted to leave Twitter over Musk ultimatum"
              onChange={(e) => {
                const value = e.currentTarget.value;
                const newResources = produce(resources, (draft) => {
                  draft[i].title = value;
                });
                props.onResourcesChange?.(trimResources(newResources));
              }}
            />
            <FieldHeader className="mt-3 mb-1">URL</FieldHeader>
            <Input
              className="w-full"
              value={resource.url}
              placeholder="e.g. https://www.washingtonpost.com/technology/2022/11/17/twitter-musk-easing-rto-order/"
              onChange={(e) => {
                const value = e.currentTarget.value;
                const newResources = produce(resources, (draft) => {
                  draft[i].url = value;
                });
                props.onResourcesChange?.(trimResources(newResources));
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
