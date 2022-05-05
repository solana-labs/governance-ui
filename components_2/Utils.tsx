import { useMediaQuery } from 'react-responsive'

export default function useIsExtensionWidth({ width }) {
  return useMediaQuery({ query: `(max-width: ${width}px)` })
}
