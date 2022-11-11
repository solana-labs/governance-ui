import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { Hub } from '@hub/components/Hub'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'
import { useRealmPublicKey } from '@hub/hooks/useRealmPublicKey'

export default function RealmAbout() {
  const router = useRouter()
  const { id } = router.query
  const publicKey = useRealmPublicKey(id)

  useEffect(() => {
    if (publicKey?.equals(ECOSYSTEM_PAGE)) {
      router.replace('/discover')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
