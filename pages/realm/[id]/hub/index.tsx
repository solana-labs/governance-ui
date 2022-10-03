import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'

import mainnetList from 'public/realms/mainnet-beta.json'
import devnetList from 'public/realms/devnet.json'

import { Hub } from '@hub/components/Hub'

export default function RealmAbout() {
  const router = useRouter()
  const { id } = router.query

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
        <title>About</title>
        <meta property="og:title" content="About" key="title" />
      </Head>
      <Hub realm={publicKey} realmUrlId={id as string} />
    </div>
  )
}
