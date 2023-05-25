import { useRouter } from 'next/router'
import LockTokensAccountWithdraw from 'VoteStakeRegistry/components/Account/LockTokensAccountWithdraw'

const AccountViewPage = () => {
  const router = useRouter()

  const tokenOwnerRecordPk = router.query?.tokenOwnerRecordPk

  return (
    typeof tokenOwnerRecordPk === 'string' && (
      <LockTokensAccountWithdraw
        tokenOwnerRecordPk={tokenOwnerRecordPk}
      ></LockTokensAccountWithdraw>
    )
  )
}

export default AccountViewPage
