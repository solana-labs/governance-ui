import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { FeedItem } from '@hub/components/FeedItem'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

export default function RealmFeedItem() {
  const router = useRouter()
  const { id, feedItemId } = router.query

  if (typeof feedItemId !== 'string') {
    throw new Error('Not a valid feed')
  }

  useEffect(() => {
    if (id === ECOSYSTEM_PAGE.toBase58()) {
      router.replace('/ecosystem')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [id])

  if (id === ECOSYSTEM_PAGE.toBase58()) {
    return <div />
  }

  return (
    <div>
      <Head>
        <title>Realm</title>
        <meta property="og:title" content="Realm" key="title" />
      </Head>
      <FeedItem feedItemId={feedItemId} realmUrlId={id as string} />
    </div>
  )
}
