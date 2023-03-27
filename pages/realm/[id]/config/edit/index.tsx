import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { ECOSYSTEM_PAGE } from '@hub/lib/constants'
import { EditRealmConfig } from '@hub/components/EditRealmConfig'

export default function EditRealmConfigPage() {
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
        <title>Edit Org Config</title>
        <meta property="og:title" content="Edit Org Config" key="title" />
      </Head>
      <EditRealmConfig className="min-h-screen" realmUrlId={id as string} />
    </div>
  )
}
