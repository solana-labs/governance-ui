import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { Home } from '@hub/components/Home'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'
import { useRealmPublicKey } from '@hub/hooks/useRealmPublicKey'

export default function Realm() {
  const router = useRouter()
  const { id } = router.query
  const publicKey = useRealmPublicKey(id)

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
