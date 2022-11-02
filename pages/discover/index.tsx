import Head from 'next/head'

import { DiscoverPage } from '@hub/components/DiscoverPage'

export default function Discover() {
  return (
    <div>
      <Head>
        <title>Discover</title>
        <meta property="og:title" content="Discover" key="title" />
      </Head>
      <DiscoverPage className="pt-14" />
    </div>
  )
}
