import type { AppProps } from 'next/app'
import '@dialectlabs/react-ui/index.css'

import { App as BaseApp } from '@components/App'
import { App as HubApp } from '@hub/App'

import '../styles/index.css'
import '../styles/typography.css'
import '@hub/components/controls/RichTextEditor/index.css'
import { useEffect } from 'react'
import useSerumGovStore from 'stores/useSerumGovStore'

export default function App({ Component, pageProps, router }: AppProps) {
  const { cluster } = router.query
  const updateSerumGovAccounts = useSerumGovStore(
    (s) => s.actions.updateSerumGovAccounts
  )

  useEffect(() => {
    updateSerumGovAccounts(cluster as string | undefined)
  }, [cluster])

  if (router.pathname.startsWith('/code')) {
    return <Component {...pageProps} />
  }

  if (
    router.pathname.startsWith('/realm/[id]') ||
    router.pathname.startsWith('/ecosystem') ||
    router.pathname.startsWith('/discover')
  ) {
    return (
      <HubApp>
        <Component {...pageProps} />
      </HubApp>
    )
  }

  return (
    <BaseApp>
      <Component {...pageProps} />
    </BaseApp>
  )
}
