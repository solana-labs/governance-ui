import { ThemeProvider } from 'next-themes'
import { WalletIdentityProvider } from '@cardinal/namespaces-components'
import dynamic from 'next/dynamic'
import React, { useEffect, useMemo } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { GatewayProvider } from '@components/Gateway/GatewayProvider'
import { useVotingPlugins } from '@hooks/useVotingPlugins'
import { VSR_PLUGIN_PKS } from '@constants/plugins'
import ErrorBoundary from '@components/ErrorBoundary'
import useHandleGovernanceAssetsStore from '@hooks/handleGovernanceAssetsStore'
import handleRouterHistory from '@hooks/handleRouterHistory'
import NavBar from '@components/NavBar'
import PageBodyContainer from '@components/PageBodyContainer'
import tokenPriceService from '@utils/services/tokenPrice'
import TransactionLoader from '@components/TransactionLoader'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import NftVotingCountingModal from '@components/NftVotingCountingModal'
import { getResourcePathPart } from '@tools/core/resources'
import useSerumGovStore from 'stores/useSerumGovStore'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { DEVNET_RPC, MAINNET_RPC } from 'constants/endpoints'
import {
  SquadsEmbeddedWalletAdapter,
  detectEmbeddedInSquadsIframe,
} from '@sqds/iframe-adapter'
import { WALLET_PROVIDERS } from '@utils/wallet-adapters'
import { tryParsePublicKey } from '@tools/core/pubkey'

const Notifications = dynamic(() => import('../components/Notification'), {
  ssr: false,
})

const GoogleTag = React.memo(
  function GoogleTag() {
    return (
      <React.Fragment>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-TG90SK6TGB"
        />
        <Script id="gta-main">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TG90SK6TGB');
        `}</Script>
      </React.Fragment>
    )
  },
  () => true
)

interface Props {
  children: React.ReactNode
}

/** AppContents depends on providers itself, sadly, so this is where providers go.  */
export function App(props: Props) {
  const router = useRouter()
  const { cluster } = router.query

  const endpoint = useMemo(
    () => (cluster === 'devnet' ? DEVNET_RPC : MAINNET_RPC),
    [cluster]
  )

  const supportedWallets = useMemo(
    () =>
      detectEmbeddedInSquadsIframe()
        ? [new SquadsEmbeddedWalletAdapter()]
        : WALLET_PROVIDERS.map((provider) => provider.adapter),
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={supportedWallets}>
        <AppContents {...props} />{' '}
      </WalletProvider>
    </ConnectionProvider>
  )
}

export function AppContents(props: Props) {
  handleRouterHistory()
  useVotingPlugins()
  useHandleGovernanceAssetsStore()
  useEffect(() => {
    tokenPriceService.fetchSolanaTokenList()
  }, [])

  const { getOwnedDeposits, resetDepositState } = useDepositStore()

  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result

  const { realmInfo } = useRealm()
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)

  const router = useRouter()
  const { cluster, symbol } = router.query
  const updateSerumGovAccounts = useSerumGovStore(
    (s) => s.actions.updateSerumGovAccounts
  )

  const realmName = realmInfo?.displayName ?? realm?.account?.name
  const title = realmName ? `${realmName}` : 'Realms'

  // Note: ?v==${Date.now()} is added to the url to force favicon refresh.
  // Without it browsers would cache the last used and won't change it for different realms
  // https://stackoverflow.com/questions/2208933/how-do-i-force-a-favicon-refresh
  const faviconUrl =
    symbol &&
    tryParsePublicKey(symbol as string) === undefined && // don't try to use a custom favicon if this is a pubkey-based url
    `/realms/${getResourcePathPart(
      symbol as string
    )}/favicon.ico?v=${Date.now()}`

  useEffect(() => {
    if (
      realm &&
      config?.account.communityTokenConfig.voterWeightAddin &&
      VSR_PLUGIN_PKS.includes(
        config.account.communityTokenConfig.voterWeightAddin.toBase58()
      ) &&
      realm.pubkey &&
      wallet?.connected &&
      ownTokenRecord &&
      vsrClient
    ) {
      getOwnedDeposits({
        realmPk: realm.pubkey,
        communityMintPk: realm.account.communityMint,
        walletPk: ownTokenRecord!.account!.governingTokenOwner,
        client: vsrClient,
        connection: connection.current,
      })
    } else if (!wallet?.connected || !ownTokenRecord) {
      resetDepositState()
    }
  }, [
    config?.account.communityTokenConfig.voterWeightAddin,
    connection,
    getOwnedDeposits,
    ownTokenRecord,
    realm,
    resetDepositState,
    vsrClient,
    wallet?.connected,
  ])

  useEffect(() => {
    updateSerumGovAccounts(cluster as string | undefined)
  }, [cluster, updateSerumGovAccounts])

  return (
    <div className="relative bg-bkg-1 text-fgd-1">
      <Head>
        <meta property="og:title" content={title} key="title" />
        <title>{title}</title>
        <style>{`
          body {
            background-color: #17161c;
          }
        `}</style>
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
      <GoogleTag />
      <ErrorBoundary>
        <ThemeProvider defaultTheme="Dark">
          <WalletIdentityProvider appName={'Realms'}>
            <GatewayProvider>
              <NavBar />
              <Notifications />
              <TransactionLoader></TransactionLoader>
              <NftVotingCountingModal />
              <PageBodyContainer>{props.children}</PageBodyContainer>
            </GatewayProvider>
          </WalletIdentityProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  )
}
