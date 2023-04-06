import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { Hub } from '@hub/components/Hub'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

export default function RealmAbout() {
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id === ECOSYSTEM_PAGE.toBase58()) {
      router.replace('/ecosystem')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [id])

  if (id === ECOSYSTEM_PAGE.toBase58()) {
    return <div />
  }

  return (
    <div>
      <Head>
        <title>About</title>
        <meta property="og:title" content="About" key="title" />
      </Head>
      <Hub realmUrlId={id as string} />
    </div>
  )
}
