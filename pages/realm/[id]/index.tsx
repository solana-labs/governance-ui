import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'

import { Home } from '@hub/components/Home'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

import mainnetList from 'public/realms/mainnet-beta.json'
import devnetList from 'public/realms/devnet.json'

export default function Realm() {
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

    if (id.toLowerCase() === 'ecosystem') {
      publicKey = ECOSYSTEM_PAGE
    }
  }

  if (!publicKey) {
    try {
      publicKey = new PublicKey(id as string)
    } catch {
      throw new Error('Not a valid realm')
    }
  }

  useEffect(() => {
    if (publicKey?.equals(ECOSYSTEM_PAGE)) {
      router.replace('/ecosystem')
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
      <Home realm={publicKey} realmUrlId={id as string} />
    </div>
  )
}
