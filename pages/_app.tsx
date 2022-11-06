import type { AppProps } from 'next/app'
import '@dialectlabs/react-ui/index.css'

import { App as BaseApp } from '@components/App'
import { App as HubApp } from '@hub/App'

import '../styles/index.css'
import '../styles/typography.css'
import '@hub/components/controls/RichTextEditor/index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from '@hooks/queries/queryClient'

export default function App({ Component, pageProps, router }: AppProps) {
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
