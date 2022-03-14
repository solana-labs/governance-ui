import useRouterHistoryStore from 'stores/useRouterHistoryStore'
import useQueryContext from './useQueryContext'
import useRealm from './useRealm'

//nextjs don't provide route history out of the box.
//we store only 4 last routes
export default function useRouterHistory() {
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol } = useRealm()
  const history = useRouterHistoryStore((s) => s.history)

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
  }
  return {
    history,
    getLastRoute,
  }
}
