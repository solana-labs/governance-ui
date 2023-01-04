import { pipe } from 'fp-ts/lib/function';

import { GlobalFooter } from '@hub/components/GlobalFooter';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import { AllOrgs } from './AllOrgs';
import * as gql from './gql';
import { Hackathon } from './Hackathon';
import { NotableDAOTooling } from './NotableDAOTooling';
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
  const [result] = useQuery(gql.getDiscoverPageResp, {
    query: gql.getDiscoverPage,
  });

  return pipe(
    result,
    RE.match(
      () => <div />,
      () => <div />,
      ({ discoverPage }) => (
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
                announcements={discoverPage.keyAnnouncements}
                trending={discoverPage.trending}
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
            <Noteworthy
              className="mt-16 w-full"
              items={discoverPage.spotlight}
            />
            <div className="mt-16 md:pr-16 max-w-[1188px]">
              <Hackathon realms={discoverPage.hackathonWinners} />
              <Popular className="mt-16" realms={discoverPage.popular} />
              <NotableNFTs
                className="mt-16"
                realms={discoverPage.nftCollections}
              />
              <NotableDefi className="mt-16" realms={discoverPage.defi} />
              <NotableGames className="mt-16" realms={discoverPage.gaming} />
              <NotableDAOTooling
                className="mt-16"
                realms={discoverPage.daoTooling}
              />
              <NotableWeb3 className="mt-16" realms={discoverPage.web3} />
              <AllOrgs className="mt-16" />
            </div>
            <GlobalFooter className="max-w-3xl mx-auto mt-12" />
          </div>
        </div>
      ),
    ),
  );
}
