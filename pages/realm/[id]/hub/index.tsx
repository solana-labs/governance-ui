import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'

import mainnetList from 'public/realms/mainnet-beta.json'
import devnetList from 'public/realms/devnet.json'

import { Hub } from '@hub/components/Hub'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

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
      router.replace('/discover')
    }
  }, [publicKey])

  if (publicKey.equals(ECOSYSTEM_PAGE)) {
    return <div />
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
