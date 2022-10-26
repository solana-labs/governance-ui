import cx from '@hub/lib/cx';

import { AllOrgs } from './AllOrgs';
import { Hackathon } from './Hackathon';
import { NotableNFTs } from './NotableNFTs';
import { NotableProjects } from './NotableProjects';
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
        'grid-cols-[418px,1fr]',
        'grid',
        '2xl:ml-[calc((100vw-1536px)/2)]',
        'overflow-x-visible',
        props.className,
      )}
    >
      <div className="p-4">
        <div className="top-[72px] sticky">
          <Sidebar />
        </div>
      </div>
      <div className="py-8 w-full overflow-hidden">
        <Title />
        <Popular className="mt-16 w-full" />
        <div className="mt-16 pr-16 max-w-[1188px]">
          <Hackathon />
          <NotableProjects className="mt-16" />
          <NotableNFTs className="mt-16" />
          <AllOrgs className="mt-16" />
        </div>
      </div>
    </div>
  );
}
