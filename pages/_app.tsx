import { ThemeProvider } from 'next-themes';
import '../styles/index.css';
import useWallet from '../hooks/useWallet';
import Notifications from '../components/Notification';
import NavBar from '../components/NavBar';
import PageBodyContainer from '../components/PageBodyContainer';
import useHydrateStore from '../hooks/useHydrateStore';
import useRealm from '../hooks/useRealm';
import { getResourcePathPart } from '../tools/core/resources';
import handleRouterHistory from '@hooks/handleRouterHistory';
import { useEffect } from 'react';
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore';
import useWalletStore from 'stores/useWalletStore';
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry';
import ErrorBoundary from '@components/ErrorBoundary';
import { WalletIdentityProvider } from '@cardinal/namespaces-components';
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore';
import useMarketStore from 'Strategies/store/marketStore';
import handleGovernanceAssetsStore from '@hooks/handleGovernanceAssetsStore';
import tokenService from '@utils/services/token';

function App({ Component, pageProps }) {
  useHydrateStore();
  useWallet();
  handleRouterHistory();
  useVoteRegistry();
  handleGovernanceAssetsStore();
  useEffect(() => {
    tokenService.fetchSolanaTokenList();
  }, []);
  const { loadMarket } = useMarketStore();
  const { getOwnedDeposits, resetDepositState } = useDepositStore();
  const { realm, realmInfo, symbol, ownTokenRecord } = useRealm();
  const wallet = useWalletStore((s) => s.current);
  const connection = useWalletStore((s) => s.connection);
  const client = useVoteStakeRegistryClientStore((s) => s.state.client);
  const realmName = realmInfo?.displayName ?? realm?.account?.name;

  const title = realmName ? `${realmName}` : 'Solana Governance';

  // Note: ?v==${Date.now()} is added to the url to force favicon refresh.
  // Without it browsers would cache the last used and won't change it for different realms
  // https://stackoverflow.com/questions/2208933/how-do-i-force-a-favicon-refresh
  const faviconSelector = symbol ?? 'SOLANA';
  const faviconUrl = `/realms/${getResourcePathPart(
    faviconSelector as string,
  )}/favicon.ico?v=${Date.now()}`;
  useEffect(() => {
    loadMarket(connection, connection.cluster);
  }, [connection.cluster]);
  useEffect(() => {
    if (
      realm?.account.config.useCommunityVoterWeightAddin &&
      realm.pubkey &&
      wallet?.connected &&
      client
    ) {
      getOwnedDeposits({
        realmPk: realm!.pubkey,
        communityMintPk: realm!.account.communityMint,
        walletPk: wallet!.publicKey!,
        client: client!,
        connection: connection.current,
      });
    } else if (!wallet?.connected) {
      resetDepositState();
    }
  }, [
    realm?.pubkey.toBase58(),
    ownTokenRecord?.pubkey.toBase58(),
    wallet?.connected,
    client,
  ]);
  //remove Do not add <script> tags using next/head warning
  useEffect(() => {
    const changeFavicon = (link) => {
      let $favicon = document.querySelector('link[rel="icon"]');
      // If a <link rel="icon"> element already exists,
      // change its href to the given link.
      if ($favicon !== null) {
        //@ts-ignore
        $favicon.href = link;
        // Otherwise, create a new element and append it to <head>.
      } else {
        $favicon = document.createElement('link');
        //@ts-ignore
        $favicon.rel = 'icon';
        //@ts-ignore
        $favicon.href = link;
        document.head.appendChild($favicon);
      }
    };
    changeFavicon(faviconUrl);
  }, [faviconUrl]);
  useEffect(() => {
    console.info(`Title: ${title}`);

    document.title = title;
  }, [title]);

  return (
    <div className="relative">
      <ErrorBoundary>
        <ThemeProvider defaultTheme="Mango">
          <WalletIdentityProvider appName={'Realms'}>
            <NavBar />
            <Notifications />
            <PageBodyContainer>
              <Component {...pageProps} />
            </PageBodyContainer>
          </WalletIdentityProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
