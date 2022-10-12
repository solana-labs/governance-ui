import type { AppProps } from 'next/app'
import '@dialectlabs/react-ui/index.css'

import '../styles/index.css'
import '../styles/typography.css'
import '@hub/components/controls/RichTextEditor/index.css'

export default function App({ router }: AppProps) {
  if (router.pathname.startsWith('/realm/[id]')) {
    return <div>Offline</div>
  }

  return <div>Offline</div>
}
