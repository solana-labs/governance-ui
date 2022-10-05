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
    <article className={cx('w-full', 'bg-white', 'py-20', props.className)}>
      <header className="flex items-center justify-center">
        <OpenPanelFilledBottomIcon className="fill-neutral-200 h-8 w-8" />
        <div className="text-4xl font-semibold text-neutral-900 ml-5">
          Gallery
        </div>
      </header>
      <div className="mt-16 overflow-y-hidden overflow-x-auto">
        <div className="flex items-center space-x-16">
          <div className="w-4 shrink-0 h-2" />
          {props.items.map((item, i) => (
            <div className="flex flex-col items-center shrink-0">
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
                  key={i}
                  src={item.url}
                  style={{
                    height: item.height,
                    width: item.width,
                  }}
                />
              )}
              {item.caption && (
                <div className="mt-2 max-w-[80%] text-xs text-center text-neutral-700">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
          <div className="w-4 shrink-0 h-2" />
        </div>
      </div>
    </article>
  );
}
