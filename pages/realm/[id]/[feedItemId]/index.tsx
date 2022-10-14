import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'

import { FeedItem } from '@hub/components/FeedItem'
import mainnetList from 'public/realms/mainnet-beta.json'
import devnetList from 'public/realms/devnet.json'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

export default function RealmFeedItem() {
  const router = useRouter()
  const { id, feedItemId } = router.query

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
      <FeedItem feedItemId={feedItemId} realm={publicKey} realmUrlId={id} />
    </div>
  )
}
