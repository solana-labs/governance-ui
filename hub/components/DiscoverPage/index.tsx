import cx from '@hub/lib/cx';

import { AllOrgs } from './AllOrgs';
import { Hackathon } from './Hackathon';
import { NotableDefi } from './NotableDefi';
import { NotableGames } from './NotableGames';
import { NotableNFTs } from './NotableNFTs';
import { NotableWeb3 } from './NotableWeb3';
import { Noteworthy } from './Noteworthy';
import { Popular } from './Popular';
import { Sidebar } from './Sidebar';
import { Title } from './Title';

interface Props {
  className?: string;
}

export function DiscoverPage(props: Props) {
  return (
    <div
      className={cx(
        'gap-x-12',
        'xl:grid-cols-[418px,1fr]',
        'grid',
        '2xl:ml-[calc((100vw-1536px)/2)]',
        'overflow-x-visible',
        props.className,
      )}
    >
      <div className="hidden p-4 xl:block">
        <div className="top-[72px] sticky">
          <Sidebar
            className={cx('max-h-[calc(100vh-88px)]', 'overflow-y-auto')}
          />
        </div>
      </div>
      <div
        className={cx(
          'overflow-hidden',
          'pl-3',
          'pr-3',
          'py-8',
          'w-full',
          'md:pl-16',
          'md:pr-0',
          'xl:pl-0',
        )}
      >
        <Title />
        <Noteworthy className="mt-16 w-full" />
        <div className="mt-16 md:pr-16 max-w-[1188px]">
          <Hackathon />
          <Popular className="mt-16" />
          <NotableDefi className="mt-16" />
          <NotableNFTs className="mt-16" />
          <NotableGames className="mt-16" />
          <NotableWeb3 className="mt-16" />
          <AllOrgs className="mt-16" />
        </div>
      </div>
    </div>
  );
}
