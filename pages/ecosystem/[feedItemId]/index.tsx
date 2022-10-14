import Head from 'next/head'
import { useRouter } from 'next/router'

import { FeedItem } from '@hub/components/FeedItem'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

export default function EcosystemFeedItem() {
  const router = useRouter()
  const { feedItemId } = router.query

  return (
    <div>
      <Head>
        <title>Realm</title>
        <meta property="og:title" content="Realm" key="title" />
      </Head>
      <FeedItem
        feedItemId={feedItemId as string}
        realm={ECOSYSTEM_PAGE}
        realmUrlId="ecosystem"
      />
    </div>
  )
}
