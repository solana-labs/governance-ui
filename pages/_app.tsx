import Head from 'next/head'
import { ThemeProvider } from 'next-themes'
import '../styles/index.css'
import useWallet from '../hooks/useWallet'
import Notifications from '../components/Notification'
import NavBar from '../components/NavBar'
import PageBodyContainer from '../components/PageBodyContainer'

function App({ Component, pageProps }) {
  useWallet()

  const title = 'Mango Markets'
  const description =
    'Claim your stake in the Mango DAO. Join us in building Mango, the protocol for permissionless leverage trading & lending.'
  const keywords =
    'Mango Markets, Serum, SRM, Serum DEX, DEFI, Decentralized Finance, Decentralised Finance, Crypto, ERC20, Ethereum, Decentralize, Solana, SOL, SPL, Cross-Chain, Trading, Fastest, Fast, SerumBTC, SerumUSD, SRM Tokens, SPL Tokens'
  const baseUrl = 'https://token.mango.markets'

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=PT+Mono&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content={keywords} />
        <meta name="description" content={description} />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${baseUrl}/preview.jpg`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@mangomarkets" />
      </Head>
      <ThemeProvider defaultTheme="Mango">
        <NavBar />
        <Notifications />
        <PageBodyContainer>
          <Component {...pageProps} />
        </PageBodyContainer>
      </ThemeProvider>
    </>
  )
}

export default App
