import { useRouter } from 'next/router'
import { EndpointTypes } from '../models/types'

export default function useRealmContext() {
  const router = useRouter()
  const { cluster } = router.query
  const { REALM } = process.env

  const isOneRealmMode = REALM
  const endpoint = cluster ? (cluster as EndpointTypes) : 'mainnet'
  const hasClusterOption = endpoint !== 'mainnet'
  const generateUrlWithClusterParam = (url) => {
    if (hasClusterOption) {
      const mark = url.includes('?') ? '&' : '?'
      return decodeURIComponent(`${url}${mark}cluster=${endpoint}`)
    }
    return url
  }

  return {
    isOneRealmMode,
    generateUrlWithClusterParam,
  }
}
