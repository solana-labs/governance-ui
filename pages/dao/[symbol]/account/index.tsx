import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import useRealm from '@hooks/useRealm'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'

const account = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realm } = useRealm()
  const getAccountView = () => {
    const isLockTokensMode = realm?.account.config.useCommunityVoterWeightAddin
    if (isLockTokensMode) {
      return <LockTokensAccount></LockTokensAccount>
    }
    //no default for now redirect to main view
    router.push(fmtUrlWithCluster(`/dao/${symbol}/`))
  }
  return getAccountView()
}

export default account
