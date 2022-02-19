import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'

const account = () => {
  const router = useRouter()
  const { realm } = useRealm()
  const tokenOwnerRecordPk = router?.query?.tokenOwnerRecordPk
  const isLockTokensMode = realm?.account.config.useCommunityVoterWeightAddin
  const getAccountView = () => {
    if (isLockTokensMode) {
      return (
        <LockTokensAccount
          tokenOwnerRecordPk={tokenOwnerRecordPk}
        ></LockTokensAccount>
      )
    }
    return null
  }
  return getAccountView()
}

export default account
