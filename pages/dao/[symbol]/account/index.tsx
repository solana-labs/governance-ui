import LockTokensAccount from '@components/Account/LockTokensAccount'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import useRealm from '@hooks/useRealm'

const account = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol } = useRealm()
  const getAccountView = () => {
    //based on realm config it will provide proper account view
    const isLockTokensMode = true
    if (isLockTokensMode) {
      return <LockTokensAccount></LockTokensAccount>
    }
    //no default for now redirect to main view
    router.push(fmtUrlWithCluster(`/dao/${symbol}/`))
  }
  return getAccountView()
}

export default account
