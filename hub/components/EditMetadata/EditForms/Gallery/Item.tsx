import { useState } from 'react';

import { FieldDescription } from '../common/FieldDescription';
import { FieldHeader } from '../common/FieldHeader';
import { FieldIconPreview } from '../common/FieldIconPreview';
import { SecondaryRed } from '@hub/components/controls/Button';
import { Input } from '@hub/components/controls/Input';

interface Props {
  caption: null | string;
  className?: string;
  height: number;
  index: number;
  url: string;
  width: number;
  onChange?(updates: {
    caption: null | string;
    height: number;
    url: string;
    width: number;
  }): void;
  onDelete?(): void;
}

export function Item(props: Props) {
  const [urlInvalid, setUrlInvalid] = useState(false);

  return (
    <div className={props.className}>
      <div className="flex items-center justify-between mb-2">
        <h1 className="my-0 text-xl sm:text-2xl text-sky-500 font-medium leading-[40px]">
          Visual {props.index + 1}
        </h1>
        <SecondaryRed
          disabled={!props.url && !props.caption}
          onClick={props.onDelete}
        >
          Delete visual
        </SecondaryRed>
      </div>
      <FieldHeader className="mb-1 mt-8">URL</FieldHeader>
      <FieldDescription>
        You may add a URL to a PNG, JPG or Youtube video.
      </FieldDescription>
      <div className="grid items-center grid-cols-[1fr,56px] gap-x-4 mt-2">
        <Input
          className="w-full"
          placeholder="e.g. imgur.com/avatar.png"
          value={props.url}
          onChange={(e) => {
            const value = e.currentTarget.value;
            const updates = {
              caption: props.caption,
              height: props.height,
              url: value,
              width: props.width,
            };
            props.onChange?.(updates);
          }}
        />
        <FieldIconPreview
          allowYoutube
          className="rounded"
          url={props.url}
          onError={() => setUrlInvalid(true)}
          onClearError={() => setUrlInvalid(false)}
        />
      </div>
      {urlInvalid && (
        <div className="text-xs text-rose-500 mt-1 grid grid-cols-[1fr,56px] gap-x-4">
          <div>
            The URL should support hot-linking, and should point to an image or
            Youtube video. It appears that the URL you provided doesn't work.
            Please try another URL.
          </div>
          <div />
        </div>
      )}
      <FieldHeader className="mb-1 mt-6">Caption</FieldHeader>
      <Input
        className="w-full"
        placeholder="e.g. This describes the visual"
        value={props.caption || ''}
        onChange={(e) => {
          const value = e.currentTarget.value;
          const updates = {
            caption: value,
            height: props.height,
            url: props.url,
            width: props.width,
          };
          props.onChange?.(updates);
        }}
      />
    </div>
  );
}
