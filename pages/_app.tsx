import type { AppProps } from 'next/app'
import '@dialectlabs/react-ui/index.css'

import { App as BaseApp } from '@components/App'
import { App as HubApp } from '@hub/App'

import '../styles/index.css'
import '../styles/typography.css'
import '@hub/components/controls/RichTextEditor/index.css'
import '../components/DropdownMenu/index.css'

export default function App({ Component, pageProps, router }: AppProps) {
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
