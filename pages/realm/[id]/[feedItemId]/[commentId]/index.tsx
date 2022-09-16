import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'

import mainnetList from 'public/realms/mainnet-beta.json'
import devnetList from 'public/realms/devnet.json'
import { FeedItemComment } from '@hub/components/FeedItemComment'

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
