import { ThemeProvider } from 'next-themes'
import { WalletIdentityProvider } from '@cardinal/namespaces-components'
import dynamic from 'next/dynamic'
import React, { useEffect, useMemo } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { GatewayProvider } from '@components/Gateway/GatewayProvider'
import { usePrevious } from '@hooks/usePrevious'
import { useVotingPlugins, vsrPluginsPks } from '@hooks/useVotingPlugins'
import ErrorBoundary from '@components/ErrorBoundary'
import useHandleGovernanceAssetsStore from '@hooks/handleGovernanceAssetsStore'
import handleRouterHistory from '@hooks/handleRouterHistory'
import NavBar from '@components/NavBar'
import PageBodyContainer from '@components/PageBodyContainer'
import tokenPriceService from '@utils/services/tokenPrice'
import TransactionLoader from '@components/TransactionLoader'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useMembers from '@components/Members/useMembers'
import useRealm from '@hooks/useRealm'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import NftVotingCountingModal from '@components/NftVotingCountingModal'
import { getResourcePathPart } from '@tools/core/resources'
import useSerumGovStore from 'stores/useSerumGovStore'
import { WalletProvider } from '@hub/providers/Wallet'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'

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

export function App(props: Props) {
  handleRouterHistory()
  useVotingPlugins()
  useHandleGovernanceAssetsStore()
  useMembers()
  useEffect(() => {
    tokenPriceService.fetchSolanaTokenList()
  }, [])
  const { governedTokenAccounts } = useGovernanceAssets()
  const possibleNftsAccounts = useMemo(
    () => governedTokenAccounts.filter((x) => x.isSol || x.isNft),
    [governedTokenAccounts]
  )
  const { getNfts } = useTreasuryAccountStore()
  const { getOwnedDeposits, resetDepositState } = useDepositStore()

  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result

  const { realmInfo } = useRealm()
  const wallet = useWalletOnePointOh()
  const connection = useWalletStore((s) => s.connection)
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const prevStringifyPossibleNftsAccounts = usePrevious(
    JSON.stringify(possibleNftsAccounts)
  )
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
    `/realms/${getResourcePathPart(
      symbol as string
    )}/favicon.ico?v=${Date.now()}`

  useEffect(() => {
    if (
      realm &&
      config?.account.communityTokenConfig.voterWeightAddin &&
      vsrPluginsPks.includes(
        config.account.communityTokenConfig.voterWeightAddin.toBase58()
      ) &&
      realm.pubkey &&
      wallet?.connected &&
      ownTokenRecord &&
      vsrClient
    ) {
      getOwnedDeposits({
        realmPk: realm!.pubkey,
        communityMintPk: realm!.account.communityMint,
        walletPk: ownTokenRecord!.account!.governingTokenOwner,
        client: vsrClient!,
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
    if (
      prevStringifyPossibleNftsAccounts !==
        JSON.stringify(possibleNftsAccounts) &&
      realm?.pubkey
    ) {
      getNfts(possibleNftsAccounts, connection)
    }
  }, [
    connection,
    getNfts,
    possibleNftsAccounts,
    prevStringifyPossibleNftsAccounts,
    realm?.pubkey,
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
            <WalletProvider>
              <GatewayProvider>
                <NavBar />
                <Notifications />
                <TransactionLoader></TransactionLoader>
                <NftVotingCountingModal />
                <PageBodyContainer>{props.children}</PageBodyContainer>
              </GatewayProvider>
            </WalletProvider>
          </WalletIdentityProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  )
}
