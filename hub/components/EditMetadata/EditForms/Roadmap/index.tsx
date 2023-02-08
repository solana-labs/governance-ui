import LocationStarIcon from '@carbon/icons-react/lib/LocationStar';
import {
  format,
  getMonth,
  getYear,
  setMonth,
  setYear,
  startOfMonth,
} from 'date-fns';
import { produce } from 'immer';
import { range } from 'ramda';
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { FieldDescription } from '../common/FieldDescription';
import { FieldHeader } from '../common/FieldHeader';
import { FieldRichTextEditor } from '../common/FieldRichTextEditor';
import { FieldSelect } from '../common/FieldSelect';
import { SecondaryRed } from '@hub/components/controls/Button';
import { Input } from '@hub/components/controls/Input';
import { isEmpty } from '@hub/lib/richText';
import { RichTextDocument } from '@hub/types/RichTextDocument';
import { RoadmapItemStatus } from '@hub/types/RoadmapItemStatus';

function getStatusText(status: RoadmapItemStatus) {
  switch (status) {
    case RoadmapItemStatus.Completed:
      return 'Completed';
    case RoadmapItemStatus.Delayed:
      return 'Delayed';
    case RoadmapItemStatus.InProgress:
      return 'In Progress';
    case RoadmapItemStatus.Upcoming:
      return 'Upcoming';
  }
}

function trimRoadmap(roadmap: {
  __typename?: string;
  description: null | RichTextDocument;
  items: {
    __typename?: string;
    date: null | number;
    resource: null | {
      content: null | RichTextDocument;
      title: string;
      url: string;
    };
    status: null | RoadmapItemStatus;
    title: string;
  }[];
}): {
  description: null | RichTextDocument;
  items: {
    date: null | number;
    resource: null | {
      content: null | RichTextDocument;
      title: string;
      url: string;
    };
    status: null | RoadmapItemStatus;
    title: string;
  }[];
} {
  const newRoadmap = produce(roadmap, (draft) => {
    delete draft['__typename'];

    if (draft.description && isEmpty(draft.description)) {
      draft.description = null;
    }

    draft.items = draft.items
      .filter((item) => {
        return !!item.date || !!item.resource || !!item.status || !!item.title;
      })
      .map((item) => {
        // eslint-disable-next-line
        const { __typename, ...rest } = item;
        return rest;
      });
  });

  return newRoadmap;
}

interface Props {
  className?: string;
  roadmap: {
    description: null | RichTextDocument;
    items: {
      date: null | number;
      resource: null | {
        content: null | RichTextDocument;
        title: string;
        url: string;
      };
      status: null | RoadmapItemStatus;
      title: string;
    }[];
  };
  onRoadmapChange?(roadmap: {
    description: null | RichTextDocument;
    items: {
      date: null | number;
      resource: null | {
        content: null | RichTextDocument;
        title: string;
        url: string;
      };
      status: null | RoadmapItemStatus;
      title: string;
    }[];
  }): void;
}

export function Roadmap(props: Props) {
  const isDesktop = useMediaQuery({ query: '(min-width:640px)' });
  const [keyCounter, setKeyCounter] = useState(0);
  const items = (props.roadmap.items.length
    ? [...props.roadmap.items]
    : [
        {
          date: null,
          resource: null,
          status: null,
          title: '',
        },
      ]
  ).concat({
    date: null,
    resource: null,
    status: null,
    title: '',
  });

  return (
    <section className={props.className}>
      <header className="flex items-center space-x-2">
        <LocationStarIcon className="h-4 w-4 sm:h-6 sm:w-6 fill-sky-500" />
        <div className="text-xl sm:text-3xl font-medium text-neutral-900">
          Add Your Roadmap
        </div>
      </header>
      <FieldDescription className="mt-2">
        Tell us about the journey you have been on with your project and where
        it's headed.
      </FieldDescription>
      <FieldHeader className="mt-16 mb-1">Description</FieldHeader>
      <FieldDescription>
        [Optional] Describe your roadmap in a few sentences.
      </FieldDescription>
      <FieldRichTextEditor
        className="mt-2"
        document={props.roadmap.description}
        placeholder="e.g. We are building the next…"
        onDocumentChange={(document) => {
          const value = document ? (isEmpty(document) ? null : document) : null;
          const newRoadmap = produce(props.roadmap, (draft) => {
            draft.description = value;
          });
          props.onRoadmapChange?.(newRoadmap);
        }}
      />
      <div className="mt-16 space-y-16">
        {items.map((item, i) => (
          <div key={String(keyCounter) + i}>
            <div className="flex items-center justify-between mb-2">
              <h1 className="my-0 text-xl sm:text-2xl text-sky-500 font-medium leading-[40px]">
                Milestone {i + 1}
              </h1>
              <SecondaryRed
                disabled={
                  !item.date && !item.resource && !item.status && !item.title
                }
                onClick={() => {
                  const newItems = items.filter((t, index) => index !== i);
                  const newRoadmap = produce(props.roadmap, (draft) => {
                    draft.items = newItems;
                  });
                  props.onRoadmapChange?.(trimRoadmap(newRoadmap));
                  setKeyCounter((key) => key + 1);
                }}
              >
                Delete Milestone
              </SecondaryRed>
            </div>
            <FieldHeader className="mb-1 mt-8">Title</FieldHeader>
            <Input
              className="w-full"
              placeholder="e.g. Launch our beta…"
              value={item.title}
              onChange={(e) => {
                const value = e.currentTarget.value;
                const newItems = produce(items, (draft) => {
                  draft[i].title = value;
                });
                const newRoadmap = produce(props.roadmap, (draft) => {
                  draft.items = newItems;
                });
                props.onRoadmapChange?.(trimRoadmap(newRoadmap));
              }}
            />
            <FieldHeader className="mb-1 mt-8">
              Status & Target Completion
            </FieldHeader>
            <FieldDescription>
              For a more robust roadmap, you may add features your team has
              already completed.
            </FieldDescription>
            <div className="grid items-center grid-cols-3 gap-x-3 mt-6">
              <FieldSelect
                choices={Object.values(RoadmapItemStatus).map((status) => ({
                  key: status,
                  label: getStatusText(status),
                  value: status,
                }))}
                label="Status"
                placeholder={isDesktop ? 'Select Status' : 'Status'}
                selected={item.status || undefined}
                onChange={(choice) => {
                  const newItems = produce(items, (draft) => {
                    draft[i].status = choice.value;
                  });
                  const newRoadmap = produce(props.roadmap, (draft) => {
                    draft.items = newItems;
                  });
                  props.onRoadmapChange?.(trimRoadmap(newRoadmap));
                }}
              />
              <FieldSelect
                choices={range(0, 12).map((month) => ({
                  key: String(month),
                  label: format(setMonth(new Date(), month), 'LLLL'),
                  value: month,
                }))}
                label="Month"
                placeholder={isDesktop ? 'Select Month' : 'Month'}
                selected={item.date ? String(getMonth(item.date)) : undefined}
                onChange={(choice) => {
                  const newItems = produce(items, (draft) => {
                    const current = draft[i].date || new Date();
                    const date = startOfMonth(setMonth(current, choice.value));
                    draft[i].date = date.getTime();
                  });
                  const newRoadmap = produce(props.roadmap, (draft) => {
                    draft.items = newItems;
                  });
                  props.onRoadmapChange?.(trimRoadmap(newRoadmap));
                }}
              />
              <FieldSelect
                choices={range(
                  getYear(new Date()) - 5,
                  getYear(new Date()) + 10,
                ).map((year) => ({
                  key: String(year),
                  label: String(year),
                  value: year,
                }))}
                label="Year"
                placeholder={isDesktop ? 'Select Year' : 'Year'}
                selected={item.date ? String(getYear(item.date)) : undefined}
                onChange={(choice) => {
                  const newItems = produce(items, (draft) => {
                    const current = draft[i].date || new Date();
                    const date = startOfMonth(setYear(current, choice.value));
                    draft[i].date = date.getTime();
                  });
                  const newRoadmap = produce(props.roadmap, (draft) => {
                    draft.items = newItems;
                  });
                  props.onRoadmapChange?.(trimRoadmap(newRoadmap));
                }}
              />
            </div>
            <FieldHeader className="mb-1 mt-8">Related URL</FieldHeader>
            <FieldDescription>
              Add an article, essay, or other link to help viewers learn more
              about your milestone.
            </FieldDescription>
            <Input
              className="w-full mt-2"
              placeholder="e.g. website.xyz/milestone1"
              onChange={(e) => {
                const text = e.currentTarget.value;
                const value = text
                  ? {
                      content: null,
                      title: text,
                      url: text,
                    }
                  : null;
                const newItems = produce(items, (draft) => {
                  draft[i].resource = value;
                });
                const newRoadmap = produce(props.roadmap, (draft) => {
                  draft.items = newItems;
                });
                props.onRoadmapChange?.(trimRoadmap(newRoadmap));
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
