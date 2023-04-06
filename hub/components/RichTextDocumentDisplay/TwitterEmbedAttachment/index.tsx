import { useEffect, useRef, useState } from 'react';

import cx from '@hub/lib/cx';
import { TwitterEmbedAttachment as TwitterEmbedAttachmentModel } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  attachment: TwitterEmbedAttachmentModel;
  isPreview?: boolean;
}

export function TwitterEmbedAttachment(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if ('twttr' in window && container.current) {
      const twitterApi = window['twttr' as any] as any;
      twitterApi
        .ready()
        .then(() => twitterApi.widgets.load(container.current))
        .then(() => setLoaded(true));
    }
  }, []);

  if (!props.attachment.c.h) {
    return null;
  }

  return (
    <div
      className={cx(
        props.className,
        'transition-opacity',
        'max-w-md',
        loaded ? 'opacity-100' : 'opacity-0',
        props.isPreview && 'max-h-40',
      )}
      dangerouslySetInnerHTML={{ __html: props.attachment.c.h }}
      ref={container}
      style={
        props.isPreview
          ? {
              WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)`,
              maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)`,
            }
          : undefined
      }
    />
  );
}
