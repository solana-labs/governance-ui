import useQueryContext from '@hooks/useQueryContext';
import useRealm from '@hooks/useRealm';
import { useRouter } from 'next/router';
import ConnectWalletButton from './ConnectWalletButton';

const NavBar = () => {
  const { symbol } = useRealm();
  const { fmtUrlWithCluster } = useQueryContext();

  const router = useRouter();

  const isDashboardPage = router.pathname.includes('dashboard');

  return (
    <div className="grid grid-cols-12 mb-3">
      <div className="col-span-12 xl:col-start-2 xl:col-span-10 flex h-20 items-center justify-between px-4 md:px-8 xl:px-4">
        <div className="flex items-center">
          <img src="/img/solana-logo.svg" className="h-8 mr-3" />
        </div>

        <div className="flex flex-wrap justify-center items-center">
          <button
            className={`"ml-4 mr-4 mt-1.5 mb-1.5 text-white pl-4 pt pr-4 pb ${
              isDashboardPage ? '' : 'border border-fgd-3'
            }"`}
            onClick={() => {
              router.push(fmtUrlWithCluster(`/dao/${symbol}`));
            }}
          >
            Vote
          </button>

          <button
            className={`"ml-4 mr-4 mt-1.5 mb-1.5 text-white pl-4 pt pr-4 pb ${
              isDashboardPage ? 'border border-fgd-3' : ''
            }"`}
            onClick={() => {
              router.push(fmtUrlWithCluster(`/dao/${symbol}/dashboard`));
            }}
          >
            Dashboard
          </button>
        </div>

        <ConnectWalletButton />
      </div>
    </div>
  );
};

export default NavBar;
