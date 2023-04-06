import { ThemeProvider } from 'next-themes'
import { WalletIdentityProvider } from '@cardinal/namespaces-components'
import dynamic from 'next/dynamic'
import React, { useEffect } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { GatewayProvider } from '@components/Gateway/GatewayProvider'
import { usePrevious } from '@hooks/usePrevious'
import { useVotingPlugins, vsrPluginsPks } from '@hooks/useVotingPlugins'
import ErrorBoundary from '@components/ErrorBoundary'
import handleGovernanceAssetsStore from '@hooks/handleGovernanceAssetsStore'
import handleRouterHistory from '@hooks/handleRouterHistory'
import NavBar from '@components/NavBar'
import PageBodyContainer from '@components/PageBodyContainer'
import tokenPriceService from '@utils/services/tokenPrice'
import TransactionLoader from '@components/TransactionLoader'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useHydrateStore from '@hooks/useHydrateStore'
import useMembers from '@components/Members/useMembers'
import useRealm from '@hooks/useRealm'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import NftVotingCountingModal from '@components/NftVotingCountingModal'
import { getResourcePathPart } from '@tools/core/resources'
import queryClient from '@hooks/queries/queryClient'
import useSerumGovStore from 'stores/useSerumGovStore'
import { WalletProvider } from '@hub/providers/Wallet'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

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
  useHydrateStore()
  handleRouterHistory()
  useVotingPlugins()
  handleGovernanceAssetsStore()
  useMembers()
  useEffect(() => {
    tokenPriceService.fetchSolanaTokenList()
  }, [])
  const { governedTokenAccounts } = useGovernanceAssets()
  const possibleNftsAccounts = governedTokenAccounts.filter(
    (x) => x.isSol || x.isNft
  )
  const { getNfts } = useTreasuryAccountStore()
  const { getOwnedDeposits, resetDepositState } = useDepositStore()
  const {
    realm,
    ownTokenRecord,
    realmInfo,
    symbol,
    config,
    ownDelegateTokenRecords,
    ownDelegateCouncilTokenRecords,
  } = useRealm()
  const wallet = useWalletOnePointOh()
  const connection = useWalletStore((s) => s.connection)
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const prevStringifyPossibleNftsAccounts = usePrevious(
    JSON.stringify(possibleNftsAccounts)
  )
  const walletId = wallet?.publicKey?.toBase58()
  const router = useRouter()
  const { cluster } = router.query
  const updateSerumGovAccounts = useSerumGovStore(
    (s) => s.actions.updateSerumGovAccounts
  )
  const {
    actions,
    selectedCommunityDelegate,
    selectedCouncilDelegate,
  } = useWalletStore((s) => s)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    realm?.pubkey.toBase58(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    ownTokenRecord?.pubkey.toBase58(),
    wallet?.connected,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    vsrClient?.program.programId.toBase58(),
  ])

  useEffect(() => {
    if (
      prevStringifyPossibleNftsAccounts !==
        JSON.stringify(possibleNftsAccounts) &&
      realm?.pubkey
    ) {
      getNfts(possibleNftsAccounts, connection)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(possibleNftsAccounts), realm?.pubkey.toBase58()])

  useEffect(() => {
    updateSerumGovAccounts(cluster as string | undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [cluster])

  useEffect(() => {
    if (
      ownDelegateCouncilTokenRecords &&
      ownDelegateCouncilTokenRecords.length > 0
    ) {
      actions.selectCouncilDelegate(
        ownDelegateCouncilTokenRecords[0]?.account?.governingTokenOwner?.toBase58()
      )
    } else {
      actions.selectCouncilDelegate(undefined)
    }

    if (ownDelegateTokenRecords && ownDelegateTokenRecords.length > 0) {
      actions.selectCommunityDelegate(
        ownDelegateTokenRecords[0]?.account?.governingTokenOwner?.toBase58()
      )
    } else {
      actions.selectCommunityDelegate(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    walletId,
    ownDelegateTokenRecords?.map((x) => x.pubkey.toBase58()).toString(),
    ownDelegateCouncilTokenRecords?.map((x) => x.pubkey.toBase58()).toString(),
  ])
  // whenever we change delegate, get that delegates vote record so we can display it
  useEffect(() => {
    actions.fetchDelegateVoteRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [selectedCommunityDelegate, selectedCouncilDelegate])

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
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </ErrorBoundary>
    </div>
  )
}
