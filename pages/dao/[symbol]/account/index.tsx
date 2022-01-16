import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'

const account = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realm } = useRealm()
  const isLockTokensMode = realm?.account.config.useCommunityVoterWeightAddin
  const getAccountView = () => {
    if (isLockTokensMode) {
      return <LockTokensAccount></LockTokensAccount>
    }
    return null
  }
  useEffect(() => {
    if (!isLockTokensMode) {
      router.push(fmtUrlWithCluster(`/dao/${symbol}/`))
    }
  }, [isLockTokensMode])
  return getAccountView()
}

export default account
