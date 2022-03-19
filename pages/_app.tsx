import { ThemeProvider } from 'next-themes'
import '../styles/index.css'
import useWallet from '../hooks/useWallet'
import Notifications from '../components/Notification'
import NavBar from '../components/NavBar'
import PageBodyContainer from '../components/PageBodyContainer'
import useHydrateStore from '../hooks/useHydrateStore'
import useRealm from '../hooks/useRealm'
import { getResourcePathPart } from '../tools/core/resources'
import handleRouterHistory from '@hooks/handleRouterHistory'
import Footer from '@components/Footer'
import { useEffect } from 'react'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import useWalletStore from 'stores/useWalletStore'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import ErrorBoundary from '@components/ErrorBoundary'
import { WalletIdentityProvider } from '@cardinal/namespaces-components'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import useMarketStore from 'Strategies/store/marketStore'
import handleGovernanceAssetsStore from '@hooks/handleGovernanceAssetsStore'
import tokenService from '@utils/services/token'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { usePrevious } from '@hooks/usePrevious'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'

function App({ Component, pageProps }) {
  useHydrateStore()
  useWallet()
  handleRouterHistory()
  useVoteRegistry()
  handleGovernanceAssetsStore()
  useEffect(() => {
    tokenService.fetchSolanaTokenList()
  }, [])
  const { loadMarket } = useMarketStore()
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()

  const { getNfts } = useTreasuryAccountStore()
  const { getOwnedDeposits, resetDepositState } = useDepositStore()
  const { realm, realmInfo, symbol, ownTokenRecord } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const realmName = realmInfo?.displayName ?? realm?.account?.name
  const prevStringifyNftsGovernedTokenAccounts = usePrevious(
    JSON.stringify(nftsGovernedTokenAccounts)
  )
  const title = realmName ? `${realmName}` : 'Solana Governance'

  // Note: ?v==${Date.now()} is added to the url to force favicon refresh.
  // Without it browsers would cache the last used and won't change it for different realms
  // https://stackoverflow.com/questions/2208933/how-do-i-force-a-favicon-refresh
  const faviconSelector = symbol ?? 'SOLANA'
  const faviconUrl = `/realms/${getResourcePathPart(
    faviconSelector as string
  )}/favicon.ico?v=${Date.now()}`
  useEffect(() => {
    if (realm?.pubkey) {
      loadMarket(connection, connection.cluster)
    }
  }, [connection.cluster, realm?.pubkey.toBase58()])
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
      })
    } else if (!wallet?.connected) {
      resetDepositState()
    }
  }, [
    realm?.pubkey.toBase58(),
    ownTokenRecord?.pubkey.toBase58(),
    wallet?.connected,
    client,
  ])
  //remove Do not add <script> tags using next/head warning
  useEffect(() => {
    const changeFavicon = (link) => {
      let $favicon = document.querySelector('link[rel="icon"]')
      // If a <link rel="icon"> element already exists,
      // change its href to the given link.
      if ($favicon !== null) {
        //@ts-ignore
        $favicon.href = link
        // Otherwise, create a new element and append it to <head>.
      } else {
        $favicon = document.createElement('link')
        //@ts-ignore
        $favicon.rel = 'icon'
        //@ts-ignore
        $favicon.href = link
        document.head.appendChild($favicon)
      }
    }
    changeFavicon(faviconUrl)
  }, [faviconUrl])
  useEffect(() => {
    document.title = title
  }, [title])
  useEffect(() => {
    if (
      prevStringifyNftsGovernedTokenAccounts !==
        JSON.stringify(nftsGovernedTokenAccounts) &&
      realm?.pubkey
    ) {
      getNfts(nftsGovernedTokenAccounts, connection.current)
    }
  }, [JSON.stringify(nftsGovernedTokenAccounts), realm?.pubkey.toBase58()])
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
      <Footer />
    </div>
  )
}

export default App
