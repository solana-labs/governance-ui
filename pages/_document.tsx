import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document'

import { getGraphqlJsonSchema } from '@hub/lib/getGraphqlJsonSchema'

class RealmsDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const originalRenderPage = ctx.renderPage
    const schema = await getGraphqlJsonSchema()

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => App,
        enhanceComponent: (Component) => Component,
      })

    const initialProps = await Document.getInitialProps(ctx)

    return {
      ...initialProps,
      head: [
        ...(initialProps.head || []),
        <script
          key="script"
          dangerouslySetInnerHTML={{
            __html: `window.__SCHEMA__ = ${JSON.stringify(schema)}`,
          }}
        />,
      ],
    }
  }
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link rel="preconnect" href="https://use.typekit.net" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=PT+Mono&display=swap"
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
            property="twitter:image"
            content="https://raw.githubusercontent.com/solana-labs/governance-ui/main/public/img/logo-realms.png"
          />
          <meta name="theme-color" content="#ffffff" />
          <meta name="twitter:title" content="Realms" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default RealmsDocument
