import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'

import mainnetList from 'public/realms/mainnet-beta.json'
import devnetList from 'public/realms/devnet.json'
import { FeedItemComment } from '@hub/components/FeedItemComment'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

export default function RealmFeedItemComment() {
  const router = useRouter()
  const { id, feedItemId, commentId } = router.query

  let publicKey: PublicKey | null = null

  if (typeof id === 'string') {
    for (const item of mainnetList) {
      if (item.symbol.toLowerCase() === id.toLowerCase()) {
        publicKey = new PublicKey(item.realmId)
      }
    }

    for (const item of devnetList) {
      if (item.symbol.toLowerCase() === id.toLowerCase()) {
        publicKey = new PublicKey(item.realmId)
      }
    }

    if (id.toLowerCase() === 'ecosystem') {
      publicKey = ECOSYSTEM_PAGE
    }
  } else {
    throw new Error('Not a valid realm')
  }

  if (!publicKey) {
    try {
      publicKey = new PublicKey(id as string)
    } catch {
      throw new Error('Not a valid realm')
    }
  }

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
        realmUrlId={id}
      />
    </div>
  )
}
