import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useRouterHistoryStore from 'stores/useRouterHistoryStore'
import { usePrevious } from './usePrevious'

//nextjs don't provide route history out of the box.
//we store only 4 last routes
export default function handleRouterHistory() {
  const router = useRouter()
  const previousPath = usePrevious(router.asPath) as string
  const history = useRouterHistoryStore((s) => s.history)
  const setHistory = useRouterHistoryStore((s) => s.setHistory)

  useEffect(() => {
    if (router.asPath !== previousPath) {
      const newHistory = [...history, previousPath]
      if (newHistory.length > 4) {
        newHistory.shift()
      }
      setHistory(newHistory)
    }
  }, [router.asPath])
}
