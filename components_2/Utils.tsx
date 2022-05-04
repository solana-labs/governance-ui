import { useMediaQuery } from 'react-responsive'

export function useIsExtensionWidth() {
  return useMediaQuery({ query: '(max-width: 700px)' })
}

// export const isExtension = window.location.protocol === 'chrome-extension:'
