import Head from 'next/head'
import { useRouter } from 'next/router'

import { GraphQLProvider } from '@hub/providers/GraphQL'
import { JWTProvider } from '@hub/providers/JWT'
import { EditRealmConfig } from '@hub/components/EditRealmConfig'

export default function EditConfigPage() {
  const router = useRouter()
  const { symbol } = router.query

  return (
    <>
      <JWTProvider>
        <GraphQLProvider>
          {/* We should obviously eventually refactor the queries used by EditWalletRules so that these providers aren't needed */}
          <Head>
            <title>Edit Org Config</title>
            <meta property="og:title" content="Edit Org Config" key="title" />
          </Head>
          <div className="dark">
            <EditRealmConfig
              className="min-h-screen"
              realmUrlId={symbol as string}
            />
          </div>
        </GraphQLProvider>
      </JWTProvider>
    </>
  )
}
