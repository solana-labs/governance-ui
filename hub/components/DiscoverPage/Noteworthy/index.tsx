import ThumbUpIcon from '@carbon/icons-react/lib/ThumbsUp';

import { SpotlightItem } from '../gql';
import { LargeCard } from '@hub/components/DiscoverPage/LargeCard';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  items: SpotlightItem[];
}

export function Noteworthy(props: Props) {
  return (
    <section className={props.className}>
      <div className="flex items-center space-x-2">
        <ThumbUpIcon className="fill-neutral-700 h-4 w-4" />
        <div className="text-sm text-neutral-700 uppercase font-semibold">
          spotlight
        </div>
      </div>
      <div
        className={cx(
          'flex',
          'items-center',
          'no-scrollbar',
          'overflow-x-auto',
          'overflow-y-hidden',
          'pt-6',
          'pr-10',
          'snap-mandatory',
          'snap-x',
          'w-full',
        )}
      >
        {props.items.map((item, i) => (
          <div
            className={cx(
              'flex-shrink-0',
              'snap-start',
              'pr-6',
              'w-[90vw]',
              'md:max-w-[496px]',
            )}
            key={i}
          >
            <LargeCard
              className="bg-white"
              content={<div>{item.description}</div>}
              imgSrc={item.heroImageUrl}
              publicKey={item.publicKey}
              stats={item.stats}
              title={item.title}
              urlId={item.realm.urlId}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
