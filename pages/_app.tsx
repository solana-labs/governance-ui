import { ThemeProvider } from 'next-themes'
import '@dialectlabs/react-ui/index.css'
import '../styles/index.css'
import useWallet from '../hooks/useWallet'
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
import { useVotingPlugins, vsrPluginsPks } from '@hooks/useVotingPlugins'
import ErrorBoundary from '@components/ErrorBoundary'
import { WalletIdentityProvider } from '@cardinal/namespaces-components'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useMarketStore from 'Strategies/store/marketStore'
import handleGovernanceAssetsStore from '@hooks/handleGovernanceAssetsStore'
import tokenService from '@utils/services/token'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { usePrevious } from '@hooks/usePrevious'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useMembers from '@components/Members/useMembers'
import TransactionLoader from '@components/TransactionLoader'

import dynamic from 'next/dynamic'
import { GatewayProvider } from '@components/Gateway/GatewayProvider'
const Notifications = dynamic(() => import('../components/Notification'), {
  ssr: false,
})
function App({ Component, pageProps }) {
  useHydrateStore()
  useWallet()
  handleRouterHistory()
  useVotingPlugins()
  handleGovernanceAssetsStore()
  useMembers()
  useEffect(() => {
    tokenService.fetchSolanaTokenList()
  }, [])
  const { loadMarket } = useMarketStore()
  const { governedTokenAccounts } = useGovernanceAssets()
  const possibleNftsAccounts = governedTokenAccounts.filter(
    (x) => x.isSol || x.isNft
  )
  const { getNfts } = useTreasuryAccountStore()
  const { getOwnedDeposits, resetDepositState } = useDepositStore()
  const { realm, realmInfo, symbol, ownTokenRecord, config } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const realmName = realmInfo?.displayName ?? realm?.account?.name
  const prevStringifyPossibleNftsAccounts = usePrevious(
    JSON.stringify(possibleNftsAccounts)
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
      realm &&
      config?.account.communityVoterWeightAddin &&
      vsrPluginsPks.includes(
        config.account.communityVoterWeightAddin.toBase58()
      ) &&
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
  //hack to remove 'Do not add <script> tags using next/head warning'
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
  }, [faviconSelector])
  useEffect(() => {
    document.title = title
  }, [title])
  useEffect(() => {
    if (
      prevStringifyPossibleNftsAccounts !==
        JSON.stringify(possibleNftsAccounts) &&
      realm?.pubkey
    ) {
      getNfts(possibleNftsAccounts, connection.current)
    }
  }, [JSON.stringify(possibleNftsAccounts), realm?.pubkey.toBase58()])

  return (
    <div className="relative">
      <ErrorBoundary>
        <ThemeProvider defaultTheme="Dark">
          <WalletIdentityProvider appName={'Realms'}>
            <GatewayProvider>
              <NavBar />
              <Notifications />
              <TransactionLoader></TransactionLoader>
              <PageBodyContainer>
                <Component {...pageProps} />
              </PageBodyContainer>
            </GatewayProvider>
          </WalletIdentityProvider>
        </ThemeProvider>
      </ErrorBoundary>
      <Footer />
    </div>
  )
}

export default App
