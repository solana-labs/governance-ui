import Head from 'next/head'

import { EcosystemFeed } from '@hub/components/EcosystemFeed'

export default function Ecosystem() {
  return (
    <div>
      <Head>
        <title>Realm</title>
        <meta property="og:title" content="Realm Ecosystem" key="title" />
      </Head>
      <EcosystemFeed />
    </div>
  )
}
