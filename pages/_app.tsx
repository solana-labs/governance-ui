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
import { useEffect, useLayoutEffect, useState } from 'react'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import useWalletStore from 'stores/useWalletStore'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import ErrorBoundary from '@components/ErrorBoundary'
import { WalletIdentityProvider } from '@cardinal/namespaces-components'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import useMarketStore from 'Strategies/store/marketStore'
import handleGovernanceAssetsStore from '@hooks/handleGovernanceAssetsStore'
import { isPhantomBrowser, isSolanaBrowser, web3 } from '@utils/browserInfo'
import router, { useRouter } from 'next/router'

declare global {
    interface Window {
        solana:any;
    }
}

function App({ Component, pageProps }) {
	useHydrateStore()
	useWallet()
	const router = useRouter();
	const  { history, getLastRoute, getPathName } = useRouterHistory()
	useVoteRegistry()
	handleGovernanceAssetsStore()
	const { loadMarket } = useMarketStore()
	const { getOwnedDeposits, resetDepositState } = useDepositStore()
	const { realm, realmInfo, symbol, ownTokenRecord } = useRealm()
	const wallet = useWalletStore((s) => s.current)
	const connection = useWalletStore((s) => s.connection)
	const client = useVoteStakeRegistryClientStore((s) => s.state.client)
	const realmName = realmInfo?.displayName ?? realm?.account?.name

	const title = realmName ? `${realmName} || tokr_` : 'tokr_'
	const description = `A protocol for financing real world assets on the Solana blockchain. Discuss and vote on ${title} proposals.`

	const [pathName, setPathName] = useState('/');
	const [showNav, setShowNav] = useState(true);


	useLayoutEffect(() => {
		setShowNav((getPathName() === '/' || getPathName() === undefined) ? false : true)
		setPathName(getPathName())
	}, [history])


	const [solanaBrowser, setSolanaBrowser] = useState<boolean>(false)
	const [phantomBrowser, setPhantomBrowser] = useState<boolean>(false);

	const globalProps = {
		isSolanaBrowser: solanaBrowser,
		isPhantomBrowser: phantomBrowser,
		web3: ((solanaBrowser || phantomBrowser) ? true: false),
		...pageProps
	}

	useLayoutEffect(() => {
		setSolanaBrowser(isSolanaBrowser());
		setPhantomBrowser(isPhantomBrowser());
	}, [])


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

	useEffect(() => {
		setSolanaBrowser(isSolanaBrowser());
		setPhantomBrowser(isPhantomBrowser());
	}, [router])


	return (
		<div className="relative">
			<Head>
				<title>{title}</title>
				<link rel="preconnect" href="https://fonts.gstatic.com" />
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=PT+Mono&display=swap" rel="stylesheet" />

				<link rel="apple-touch-icon" sizes="57x57" href="/images/apple-icon-57x57.png"/>
				<link rel="apple-touch-icon" sizes="60x60" href="/images/apple-icon-60x60.png"/>
				<link rel="apple-touch-icon" sizes="72x72" href="/images/apple-icon-72x72.png"/>
				<link rel="apple-touch-icon" sizes="76x76" href="/images/apple-icon-76x76.png"/>
				<link rel="apple-touch-icon" sizes="114x114" href="/images/apple-icon-114x114.png"/>
				<link rel="apple-touch-icon" sizes="120x120" href="/images/apple-icon-120x120.png"/>
				<link rel="apple-touch-icon" sizes="144x144" href="/images/apple-icon-144x144.png"/>
				<link rel="apple-touch-icon" sizes="152x152" href="/images/apple-icon-152x152.png"/>
				<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-icon-180x180.png"/>
				<link rel="icon" type="image/png" sizes="192x192"  href="/images/android-icon-192x192.png"/>
				<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png"/>
				<link rel="icon" type="image/png" sizes="96x96" href="/images/favicon-96x96.png"/>
				<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png"/>
				<meta name="msapplication-TileColor" content="#282828"/>
				<meta name="msapplication-TileImage" content="/images/ms-icon-144x144.png"/>
				<meta name="theme-color" content="#282828" />

				{/* {faviconUrl && <link rel="icon" href={faviconUrl} />} */}

				<meta name="viewport" content="width=device-width, initial-scale=1" />

				{realmInfo?.keywords && <meta name="keywords" content={realmInfo.keywords} />}

				<meta name="description" content={description} />
				{/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<meta name="msapplication-TileColor" content="#ffffff" />
				<meta name="theme-color" content="#ffffff" /> */}

				<meta property="og:type" content="website" />
				<meta property="og:title" content={title} />
				<meta property="og:description" content={description} />
				{/* {realmInfo?.ogImage && <meta property="og:image" content={realmInfo.ogImage} />} */}

				<meta property="og:image" content="/images/tokr.png" />
				<meta name="twitter:card" content="summary" />

				{realmInfo?.twitter && <meta name="twitter:site" content={realmInfo.twitter} />}

			</Head>
			<ErrorBoundary>
				<ThemeProvider defaultTheme="Mango">
					<WalletIdentityProvider appName={'Realms'}>
						{showNav && <NavBar {...globalProps} />}
						{showNav && <Notifications />}
						<PageBodyContainer>
							<Component {...globalProps} />
						</PageBodyContainer>
					</WalletIdentityProvider>
				</ThemeProvider>
			</ErrorBoundary>
			<Footer />
		</div>
	)
}

export default App
