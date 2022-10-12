import { useEffect, useRef, useState } from 'react';

import cx from '@hub/lib/cx';
import { TwitterEmbedNode as TwitterEmbedNodeModel } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  embed: TwitterEmbedNodeModel;
  isClipped?: boolean;
  isLast?: boolean;
  showExpand?: boolean;
  onExpand?(): void;
}

export function TwitterEmbedNode(props: Props) {
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

  if (!props.embed.c.h) {
    return null;
  }

  return (
    <div
      className={cx(
        props.className,
        'transition-opacity',
        'max-w-md',
        loaded ? 'opacity-100' : 'opacity-0',
      )}
      dangerouslySetInnerHTML={{ __html: props.embed.c.h }}
      ref={container}
    />
  );
}
