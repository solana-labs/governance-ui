import OpenPanelFilledBottomIcon from '@carbon/icons-react/lib/OpenPanelFilledBottom';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';

import cx from '@hub/lib/cx';

function getYoutubeEmbedUrl(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  const id = match && match[7].length == 11 ? match[7] : null;

  if (id) {
    return `https://www.youtube.com/embed/${id}`;
  }

  return url;
}

interface Props {
  className?: string;
  items: {
    caption?: null | string;
    url: string;
    height: number;
    width: number;
  }[];
}

export function Gallery(props: Props) {
  return (
    <article className={cx('w-full', 'bg-white', 'pt-20', props.className)}>
      <header className="flex items-center px-4 md:justify-center md:px-0">
        <OpenPanelFilledBottomIcon className="fill-neutral-200 h-5 w-5 md:h-8 md:w-8" />
        <div className="font-semibold text-neutral-900 ml-5 text-2xl md:text-4xl">
          Gallery
        </div>
      </header>
      <div
        className={cx(
          'flex',
          'items-center',
          'mt-16',
          'no-scrollbar',
          'overflow-x-auto',
          'overflow-y-hidden',
          'pb-20',
          'snap-mandatory',
          'snap-x',
          'space-x-4',
          'px-4',
          'md:px-0',
          'md:space-x-16',
        )}
      >
        <div
          className="shrink-0 h-2"
          style={{
            width: props.items[0].width / 2,
          }}
        />
        {props.items.map((item, i) => (
          <div
            className={cx(
              'flex',
              'flex-col',
              'items-center',
              'shrink-0',
              'snap-start',
              'md:snap-center',
              'pl-4',
              'md:pl-0',
            )}
            key={i}
          >
            {item.url.includes('www.youtube.com') ? (
              <div
                className="rounded overflow-hidden shrink-0 max-w-[85vw]"
                style={{ width: item.width }}
              >
                <AspectRatio.Root ratio={item.width / item.height}>
                  <iframe
                    allowFullScreen
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    frameBorder="0"
                    height="100%"
                    src={getYoutubeEmbedUrl(item.url)}
                    width="100%"
                  />
                </AspectRatio.Root>
              </div>
            ) : (
              <div
                className="rounded max-w-[85vw] md:max-w-xl overflow-hidden"
                style={{ width: item.width }}
              >
                <AspectRatio.Root ratio={item.width / item.height}>
                  <img className="h-full w-full" src={item.url} />
                </AspectRatio.Root>
              </div>
            )}
            {item.caption && (
              <div className="max-w-[60%] md:max-w-[95%] h-0 text-xs text-center text-neutral-700">
                <div className="h-2 w-full" />
                {item.caption}
              </div>
            )}
          </div>
        ))}
        <div
          className="shrink-0 h-2"
          style={{
            width: props.items[props.items.length - 1].width / 2,
          }}
        />
      </div>
    </article>
  );
}
