import OpenPanelFilledBottomIcon from '@carbon/icons-react/lib/OpenPanelFilledBottom';

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
      <header className="flex items-center justify-center">
        <OpenPanelFilledBottomIcon className="fill-neutral-200 h-8 w-8" />
        <div className="text-4xl font-semibold text-neutral-900 ml-5">
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
          'space-x-16',
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
            className="flex flex-col items-center shrink-0 snap-center"
            key={i}
          >
            {item.url.includes('www.youtube.com') ? (
              <div
                className="rounded overflow-hidden shrink-0"
                style={{
                  height: item.height,
                  width: item.width,
                }}
              >
                <iframe
                  allowFullScreen
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  frameBorder="0"
                  height={item.height}
                  src={getYoutubeEmbedUrl(item.url)}
                  width={item.width}
                />
              </div>
            ) : (
              <img
                className="rounded"
                src={item.url}
                style={{
                  height: item.height,
                  width: item.width,
                }}
              />
            )}
            {item.caption && (
              <div className="max-w-[80%] h-0 text-xs text-center text-neutral-700">
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
