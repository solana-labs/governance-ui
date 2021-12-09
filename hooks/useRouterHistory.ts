import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { usePrevious } from './usePrevious'
import useQueryContext from './useQueryContext'
import useRealm from './useRealm'

//nextjs don't provide route history out of the box.
//we store only 4 last routes
export default function useRouterHistory() {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol } = useRealm()
  const previousPath = usePrevious(router.asPath) as string
  const [history, setHistory] = useState<string[]>([])
  useEffect(() => {
    if (router.asPath !== previousPath) {
      const newHistory = [...history, previousPath]
      if (newHistory.length > 4) {
        newHistory.shift()
      }
      setHistory(newHistory)
    }
  }, [router.asPath])
  const getLastRoute = () => {
    if (!history.length) {
      return history[history.length - 1]
    } else if (symbol) {
      //if we have dao symbol we will redirect to dao home page
      return fmtUrlWithCluster(`/dao/${symbol}/`)
    } else {
      //if user came here and dont have any dao symbol we will redirect to /realms page as home
      return fmtUrlWithCluster('/realms')
    }
    return ''
  }
  return {
    history,
    getLastRoute,
  }
}
