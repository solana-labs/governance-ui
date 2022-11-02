import Head from 'next/head'
import { useRouter } from 'next/router'

import { FeedItemComment } from '@hub/components/FeedItemComment'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

export default function EcosystemFeedItemComment() {
  const router = useRouter()
  const { feedItemId, commentId } = router.query

  return (
    <div>
      <Head>
        <title>Realm</title>
        <meta property="og:title" content="Realm" key="title" />
      </Head>
      <FeedItemComment
        commentId={commentId as string}
        feedItemId={feedItemId as string}
        realm={ECOSYSTEM_PAGE}
        realmUrlId="ecosystem"
      />
    </div>
  )
}
