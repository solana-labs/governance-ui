import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useRouterHistoryStore from 'stores/useRouterHistoryStore'
import { usePrevious } from './usePrevious'

//nextjs don't provide route history out of the box.
//we store only 4 last routes
export default function handleRouterHistory() {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const router = useRouter()
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const previousPath = usePrevious(router.asPath) as string
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const history = useRouterHistoryStore((s) => s.history)
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const setHistory = useRouterHistoryStore((s) => s.setHistory)

  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  useEffect(() => {
    if (router.asPath !== previousPath) {
      const newHistory = [...history, previousPath]
      if (newHistory.length > 4) {
        newHistory.shift()
      }
      setHistory(newHistory)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [router.asPath])
}
