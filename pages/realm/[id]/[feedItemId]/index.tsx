import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { FeedItem } from '@hub/components/FeedItem'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'
import { useRealmPublicKey } from '@hub/hooks/useRealmPublicKey'

export default function RealmFeedItem() {
  const router = useRouter()
  const { id, feedItemId } = router.query
  const publicKey = useRealmPublicKey(id)

  if (typeof feedItemId !== 'string') {
    throw new Error('Not a valid feed')
  }

  useEffect(() => {
    if (publicKey?.equals(ECOSYSTEM_PAGE)) {
      router.replace(`/ecosystem/${feedItemId}`)
    }
  }, [publicKey])

  if (publicKey.equals(ECOSYSTEM_PAGE)) {
    return <div />
  }

  return (
    <div>
      <Head>
        <title>Realm</title>
        <meta property="og:title" content="Realm" key="title" />
      </Head>
      <FeedItem
        feedItemId={feedItemId}
        realm={publicKey}
        realmUrlId={id as string}
      />
    </div>
  )
}
