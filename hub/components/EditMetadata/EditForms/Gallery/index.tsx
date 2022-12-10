import ImageIcon from '@carbon/icons-react/lib/Image';
import { produce } from 'immer';

import { FieldDescription } from '../common/FieldDescription';
import { FieldHeader } from '../common/FieldHeader';
import { FieldIconPreview } from '../common/FieldIconPreview';
import { SecondaryRed } from '@hub/components/controls/Button';
import { Input } from '@hub/components/controls/Input';

import { Item } from './Item';

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
      </FieldDescription>
      <div className="mt-16 space-y-16">
        {gallery.map((item, i) => (
          <Item
            {...item}
            index={i}
            key={i}
            onChange={(updates) => {
              const newGallery = produce(gallery, (draft) => {
                draft[i] = updates;
              });
              props.onGalleryChange?.(trimGallery(newGallery));
            }}
            onDelete={() => {
              const newGallery = gallery.filter((g, index) => index !== i);
              props.onGalleryChange?.(trimGallery(newGallery));
            }}
          />
        ))}
      </div>
    </section>
  );
}
