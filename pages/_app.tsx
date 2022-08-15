import { ThemeProvider } from 'next-themes'
import '@dialectlabs/react-ui/index.css'
// import '../styles/ambit-font.css'
import '../styles/index.css'
import '../styles/typography.css'
import useWallet from '../hooks/useWallet'
import NavBar from '../components/NavBar'
import PageBodyContainer from '../components/PageBodyContainer'
import useHydrateStore from '../hooks/useHydrateStore'
import useRealm from '../hooks/useRealm'
import { getResourcePathPart } from '../tools/core/resources'
import handleRouterHistory from '@hooks/handleRouterHistory'
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
import Head from 'next/head'
import { GatewayProvider } from '@components/Gateway/GatewayProvider'
import NftVotingCountingModal from '@components/NftVotingCountingModal'

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
  const title = realmName ? `${realmName}` : 'Realms'

  // Note: ?v==${Date.now()} is added to the url to force favicon refresh.
  // Without it browsers would cache the last used and won't change it for different realms
  // https://stackoverflow.com/questions/2208933/how-do-i-force-a-favicon-refresh
  const faviconUrl =
    symbol &&
    `/realms/${getResourcePathPart(
      symbol as string
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
      ownTokenRecord &&
      client
    ) {
      getOwnedDeposits({
        realmPk: realm!.pubkey,
        communityMintPk: realm!.account.communityMint,
        walletPk: ownTokenRecord!.account!.governingTokenOwner,
        client: client!,
        connection: connection.current,
      })
    } else if (!wallet?.connected || !ownTokenRecord) {
      resetDepositState()
    }
  }, [
    realm?.pubkey.toBase58(),
    ownTokenRecord?.pubkey.toBase58(),
    wallet?.connected,
    client?.program.programId.toBase58(),
  ])

  useEffect(() => {
    if (
      prevStringifyPossibleNftsAccounts !==
        JSON.stringify(possibleNftsAccounts) &&
      realm?.pubkey
    ) {
      getNfts(possibleNftsAccounts, connection)
    }
  }, [JSON.stringify(possibleNftsAccounts), realm?.pubkey.toBase58()])

  return (
    <div className="relative">
      <Head>
        <meta property="og:title" content={title} />
        <title>{title}</title>
        {faviconUrl ? (
          <>
            <link rel="icon" href={faviconUrl} />
          </>
        ) : (
          <>
            <link
              rel="apple-touch-icon"
              sizes="57x57"
              href="/favicons/apple-icon-57x57.png"
            />
            <link
              rel="apple-touch-icon"
              sizes="60x60"
              href="/favicons/apple-icon-60x60.png"
            />
            <link
              rel="apple-touch-icon"
              sizes="72x72"
              href="/favicons/apple-icon-72x72.png"
            />
            <link
              rel="apple-touch-icon"
              sizes="76x76"
              href="/favicons/apple-icon-76x76.png"
            />
            <link
              rel="apple-touch-icon"
              sizes="114x114"
              href="/favicons/apple-icon-114x114.png"
            />
            <link
              rel="apple-touch-icon"
              sizes="120x120"
              href="/favicons/apple-icon-120x120.png"
            />
            <link
              rel="apple-touch-icon"
              sizes="144x144"
              href="/favicons/apple-icon-144x144.png"
            />
            <link
              rel="apple-touch-icon"
              sizes="152x152"
              href="/favicons/apple-icon-152x152.png"
            />
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/favicons/apple-icon-180x180.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="192x192"
              href="/favicons/android-icon-192x192.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/favicons/favicon-32x32.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="96x96"
              href="/favicons/favicon-96x96.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/favicons/favicon-16x16.png"
            />
          </>
        )}
      </Head>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="Dark">
          <WalletIdentityProvider appName={'Realms'}>
            <GatewayProvider>
              <NavBar />
              <Notifications />
              <NftVotingCountingModal></NftVotingCountingModal>
              <TransactionLoader></TransactionLoader>
              <PageBodyContainer>
                <Component {...pageProps} />
              </PageBodyContainer>
            </GatewayProvider>
          </WalletIdentityProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  )
}

export default App
