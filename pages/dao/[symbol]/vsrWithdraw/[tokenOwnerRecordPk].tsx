import { useRouter } from 'next/router'
import LockTokensAccountWithdraw from 'VoteStakeRegistry/components/Account/LockTokensAccountWithdraw'

const account = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const router = useRouter()

  const tokenOwnerRecordPk = router?.query?.tokenOwnerRecordPk

  const getAccountView = () => {
    return (
      <LockTokensAccountWithdraw
        tokenOwnerRecordPk={tokenOwnerRecordPk}
      ></LockTokensAccountWithdraw>
    )
  }
  return getAccountView()
}

export default account
