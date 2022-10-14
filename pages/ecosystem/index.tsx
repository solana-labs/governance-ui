import Head from 'next/head'

import { Home } from '@hub/components/Home'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

export default function Realm() {
  return (
    <div>
      <Head>
        <title>Realm</title>
        <meta property="og:title" content="Realm Ecosystem" key="title" />
      </Head>
      <Home realm={ECOSYSTEM_PAGE} realmUrlId="ecosystem" />
    </div>
  )
}
