import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { FeedItemComment } from '@hub/components/FeedItemComment'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'
import { useRealmPublicKey } from '@hub/hooks/useRealmPublicKey'

export default function RealmFeedItemComment() {
  const router = useRouter()
  const { id, feedItemId, commentId } = router.query
  const publicKey = useRealmPublicKey(id)

  if (typeof commentId !== 'string') {
    throw new Error('Not a valid comment')
  }

  if (typeof feedItemId !== 'string') {
    throw new Error('Not a valid feed')
  }

  useEffect(() => {
    if (publicKey?.equals(ECOSYSTEM_PAGE)) {
      router.replace(`/ecosystem/${feedItemId}/${commentId}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
      <FeedItemComment
        commentId={commentId}
        feedItemId={feedItemId}
        realm={publicKey}
        realmUrlId={id as string}
      />
    </div>
  )
}
