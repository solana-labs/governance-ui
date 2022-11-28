import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import { useEffect, useState } from 'react';

import { getYoutubeEmbedUrl } from '@hub/components/Hub/Gallery';
import cx from '@hub/lib/cx';

interface Props {
  allowYoutube?: boolean;
  className?: string;
  url?: null | string;
  onClearError?(): void;
  onError?(): void;
}

export function FieldIconPreview(props: Props) {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(true);
  }, [setIsValid, props.url]);

  if (props.url?.includes('www.youtube.com') && props.allowYoutube) {
    return (
      <div
        className={cx(
          'border-zinc-300',
          'border',
          'h-14',
          'overflow-hidden',
          'w-14',
          props.className,
        )}
      >
        <AspectRatio.Root ratio={1}>
          <iframe
            allowFullScreen
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            frameBorder="0"
            height="100%"
            src={getYoutubeEmbedUrl(props.url)}
            width="100%"
          />
        </AspectRatio.Root>
      </div>
    );
  }

  if (props.url) {
    return (
      <img
        className={cx(
          'border-zinc-300',
          'border',
          'h-14',
          'overflow-hidden',
          'w-14',
          !isValid && 'bg-rose-200',
          props.className,
        )}
        src={props.url}
        onLoad={() => {
          setIsValid(true);
          props.onClearError?.();
        }}
        onError={() => {
          setIsValid(false);
          props.onError?.();
        }}
      />
    );
  }

  return (
    <div
      className={cx(
        'border-2',
        'border-dashed',
        'border-zinc-300',
        'h-14',
        'w-14',
        props.className,
      )}
    />
  );
}
