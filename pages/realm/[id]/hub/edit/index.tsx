import Head from 'next/head'
import { useRouter } from 'next/router'

import { EditMetadata } from '@hub/components/EditMetadata'

export default function Edit() {
  const router = useRouter()
  const { id } = router.query
  const queryStr = typeof window !== 'undefined' ? location.search : ''
  const newRealmMode = queryStr.includes('initial=true')

  return (
    <div>
      <Head>
        <title>Edit</title>
        <meta property="og:title" content="Edit" key="title" />
      </Head>
      <EditMetadata
        className="pt-14 px-4 max-w-3xl mx-auto"
        newRealmMode={newRealmMode}
        realmUrlId={id as string}
      />
    </div>
  )
}
