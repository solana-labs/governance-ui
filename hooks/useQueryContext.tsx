import { useRouter } from 'next/router'
import { EndpointTypes } from '../models/types'

export default function useQueryContext() {
  const router = useRouter()
  const { cluster } = router.query

  const endpoint = cluster ? (cluster as EndpointTypes) : 'mainnet'
  const hasClusterOption = endpoint !== 'mainnet'

  const fmtUrlWithCluster = (url, hot?: boolean) => {
    if (hasClusterOption) {
      const mark = url.includes('?') ? '&' : '?'
      return decodeURIComponent(`${url}${mark}cluster=${endpoint}`)
    }

    if (hot) {
      const mark = url.includes('?') ? '&' : '?'
      return decodeURIComponent(`${url}${mark}cluster=mainnet-hot`)
    }

    return url
  }

  return {
    fmtUrlWithCluster,
  }
}
