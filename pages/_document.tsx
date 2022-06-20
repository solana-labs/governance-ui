import { Html, Head, Main, NextScript } from 'next/document'

const Document = () => {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://use.typekit.net" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=PT+Mono&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://use.typekit.net/cwm7dgy.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta
          name="msapplication-TileImage"
          content="/favicons/ms-icon-144x144.png"
        />
        <meta
          name="twitter:image:src"
          content="https://realms.today/img/logo-realms.svg"
        ></meta>
        <meta name="theme-color" content="#ffffff" />

        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="Realms" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
