import ImageIcon from '@carbon/icons-react/lib/Image';
import { produce } from 'immer';

import { FieldDescription } from '../common/FieldDescription';
import { FieldHeader } from '../common/FieldHeader';
import { FieldIconPreview } from '../common/FieldIconPreview';
import { SecondaryRed } from '@hub/components/controls/Button';
import { Input } from '@hub/components/controls/Input';

function trimGallery(
  gallery: {
    __typename?: string;
    caption: null | string;
    url: string;
    height: number;
    width: number;
  }[],
): {
  caption: null | string;
  url: string;
  height: number;
  width: number;
}[] {
  return gallery
    .filter((g) => {
      return !!g.url;
    })
    .map((g) => {
      const { __typename, ...rest } = g;
      return rest;
    });
}

interface Props {
  className?: string;
  gallery: {
    caption: null | string;
    url: string;
    height: number;
    width: number;
  }[];
  onGalleryChange?(
    gallery: {
      caption: null | string;
      url: string;
      height: number;
      width: number;
    }[],
  ): void;
}

export function Gallery(props: Props) {
  const gallery = (props.gallery.length
    ? [...props.gallery]
    : [
        {
          caption: null,
          url: '',
          height: 0,
          width: 0,
        },
      ]
  ).concat(
    props.gallery.length < 15
      ? {
          caption: null,
          url: '',
          height: 0,
          width: 0,
        }
      : [],
  );

  return (
    <section className={props.className}>
      <header className="flex items-center space-x-2">
        <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 fill-sky-500" />
        <div className="text-xl sm:text-3xl font-medium text-neutral-900">
          Add visuals to your gallery
        </div>
      </header>
      <FieldDescription className="mt-2">
        Express your project, brand, and team activity with images and videos.
        Currently, Realms does not support image or video uploads.
      </FieldDescription>
      <div className="mt-16 space-y-16">
        {gallery.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-2">
              <h1 className="my-0 text-xl sm:text-2xl text-sky-500 font-medium leading-[40px]">
                Visual {i + 1}
              </h1>
              <SecondaryRed
                disabled={!item.url && !item.caption}
                onClick={() => {
                  const newGallery = gallery.filter((g, index) => index !== i);
                  props.onGalleryChange?.(trimGallery(newGallery));
                }}
              >
                Delete visual
              </SecondaryRed>
            </div>
            <FieldHeader className="mb-1 mt-8">URL</FieldHeader>
            <FieldDescription>
              You may add a URL to a PNG, JPG or Youtube video. The url should
              support hot-linking. Use the preview to test that the url works
              with hot-linking.
            </FieldDescription>
            <div className="grid items-center grid-cols-[1fr,56px] gap-x-4 mt-2">
              <Input
                className="w-full"
                placeholder="e.g. imgur.com/avatar.png"
                value={item.url}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  const newGallery = produce(gallery, (draft) => {
                    draft[i].url = value;
                  });
                  props.onGalleryChange?.(trimGallery(newGallery));
                }}
              />
              <FieldIconPreview
                allowYoutube
                className="rounded"
                url={item.url}
              />
            </div>
            <FieldHeader className="mb-1 mt-6">Caption</FieldHeader>
            <Input
              className="w-full"
              placeholder="e.g. This describes the visual"
              value={item.caption || ''}
              onChange={(e) => {
                const value = e.currentTarget.value;
                const newGallery = produce(gallery, (draft) => {
                  draft[i].caption = value || null;
                });
                props.onGalleryChange?.(trimGallery(newGallery));
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
