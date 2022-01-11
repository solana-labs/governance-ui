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

function App({ Component, pageProps }) {
  useHydrateStore()
  useWallet()
  useRouterHistory()
  const { realm, realmInfo, symbol } = useRealm()

  const realmName = realmInfo?.displayName ?? realm?.account?.name

  const title = realmName ? `${realmName}` : 'Solana Governance'
  const description = `Discuss and vote on ${title} proposals.`

  // Note: ?v==${Date.now()} is added to the url to force favicon refresh.
  // Without it browsers would cache the last used and won't change it for different realms
  // https://stackoverflow.com/questions/2208933/how-do-i-force-a-favicon-refresh
  const faviconSelector = symbol ?? 'SOLANA'
  const faviconUrl = `/realms/${getResourcePathPart(
    faviconSelector as string
  )}/favicon.ico?v=${Date.now()}`

  return (
    <div className="relative">
      <Head>
        <title>{title}</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=PT+Mono&display=swap"
          rel="stylesheet"
        />

        {faviconUrl && <link rel="icon" href={faviconUrl} />}

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {realmInfo?.keywords && (
          <meta name="keywords" content={realmInfo.keywords} />
        )}

        <meta name="description" content={description} />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {realmInfo?.ogImage && (
          <meta property="og:image" content={realmInfo.ogImage} />
        )}
        <meta name="twitter:card" content="summary" />

        {realmInfo?.twitter && (
          <meta name="twitter:site" content={realmInfo.twitter} />
        )}
      </Head>

      <ThemeProvider defaultTheme="Mango">
        <NavBar />
        <Notifications />
        <PageBodyContainer>
          <Component {...pageProps} />
        </PageBodyContainer>
      </ThemeProvider>

      <Footer />
    </div>
  )
}

export default App
