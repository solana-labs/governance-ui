import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'

import { FeedItem } from '@hub/components/FeedItem'
import mainnetList from 'public/realms/mainnet-beta.json'
import devnetList from 'public/realms/devnet.json'

export default function Realm() {
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
  }

  if (!publicKey) {
    try {
      publicKey = new PublicKey(id as string)
    } catch {
      throw new Error('Not a valid realm')
    }
  }

  return (
    <div>
      <Head>
        <title>Realm</title>
        <meta property="og:title" content="Realm" key="title" />
      </Head>
      <FeedItem
        feedItemId={feedItemId as string}
        realm={publicKey}
        realmUrlId={id as string}
      />
    </div>
  )
}
