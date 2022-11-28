import type { AppProps } from 'next/app'
import '@dialectlabs/react-ui/index.css'
import { QueryClientProvider } from '@tanstack/react-query'

import queryClient from '@hooks/queries/queryClient'
import { App as BaseApp } from '@components/App'
import { App as HubApp } from '@hub/App'

import '../styles/index.css'
import '../styles/typography.css'
import '@hub/components/controls/RichTextEditor/index.css'
import '../components/DropdownMenu/index.css'

import { useEffect } from 'react'
import useSerumGovStore from 'stores/useSerumGovStore'

export default function App({ Component, pageProps, router }: AppProps) {
  const { cluster } = router.query
  const updateSerumGovAccounts = useSerumGovStore(
    (s) => s.actions.updateSerumGovAccounts
  )

  useEffect(() => {
    updateSerumGovAccounts(cluster as string | undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [cluster])

  if (router.pathname.startsWith('/code')) {
    return <Component {...pageProps} />
  }
  return (
    <QueryClientProvider client={queryClient}>
      {router.pathname.startsWith('/realm/[id]') ||
      router.pathname.startsWith('/ecosystem') ||
      router.pathname.startsWith('/discover') ? (
        <HubApp>
          <Component {...pageProps} />
        </HubApp>
      ) : (
        <BaseApp>
          <Component {...pageProps} />
        </BaseApp>
      )}
    </QueryClientProvider>
  )
}
