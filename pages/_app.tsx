import Head from 'next/head'
import { ThemeProvider } from 'next-themes'
import '../styles/index.css'
import useWallet from '../hooks/useWallet'
import Notifications from '../components/Notification'
import NavBar from '../components/NavBar'
import PageBodyContainer from '../components/PageBodyContainer'
import useHydrateStore from '../hooks/useHydrateStore'
import useRealm from '../hooks/useRealm'
import { getResourcePathPart } from '../tools/core/resources'
import useRouterHistory from '@hooks/useRouterHistory'
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

function App({ Component, pageProps }) {
	useHydrateStore()
	useWallet()
	useRouterHistory()
	useVoteRegistry()
	handleGovernanceAssetsStore()
	const { loadMarket } = useMarketStore()
	const { getOwnedDeposits, resetDepositState } = useDepositStore()
	const { realm, realmInfo, symbol, ownTokenRecord } = useRealm()
	const wallet = useWalletStore((s) => s.current)
	const connection = useWalletStore((s) => s.connection)
	const client = useVoteStakeRegistryClientStore((s) => s.state.client)
	const realmName = realmInfo?.displayName ?? realm?.account?.name

	const title = realmName ? `${realmName}` : 'tokr_ Realm'
	const description = `Discuss and vote on ${title} proposals.`


	// Note: ?v==${Date.now()} is added to the url to force favicon refresh.
	// Without it browsers would cache the last used and won't change it for different realms
	// https://stackoverflow.com/questions/2208933/how-do-i-force-a-favicon-refresh
	const faviconSelector = symbol ?? 'SOLANA'
	const faviconUrl = `/realms/${getResourcePathPart(faviconSelector as string)}/favicon.ico?v=${Date.now()}`
	useEffect(() => {
		loadMarket(connection, connection.cluster)
	}, [connection.cluster])
	useEffect(() => {
		if (realm?.account.config.useCommunityVoterWeightAddin && realm.pubkey && wallet?.connected && client) {
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
	}, [realm?.pubkey.toBase58(), ownTokenRecord?.pubkey.toBase58(), wallet?.connected, client])
	return (
		<div className="relative">
			<Head>
				<title>{title}</title>
				<link rel="preconnect" href="https://fonts.gstatic.com" />
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=PT+Mono&display=swap" rel="stylesheet" />

				{faviconUrl && <link rel="icon" href={faviconUrl} />}

				<meta name="viewport" content="width=device-width, initial-scale=1" />

				{realmInfo?.keywords && <meta name="keywords" content={realmInfo.keywords} />}

				<meta name="description" content={description} />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<meta name="msapplication-TileColor" content="#ffffff" />
				<meta name="theme-color" content="#ffffff" />

				<meta property="og:type" content="website" />
				<meta property="og:title" content={title} />
				<meta property="og:description" content={description} />
				{realmInfo?.ogImage && <meta property="og:image" content={realmInfo.ogImage} />}
				<meta name="twitter:card" content="summary" />

				{realmInfo?.twitter && <meta name="twitter:site" content={realmInfo.twitter} />}
			</Head>
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
			{/* <Footer /> */}
		</div>
	)
}

export default App
