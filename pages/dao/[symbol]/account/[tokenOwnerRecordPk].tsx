import useRealm from '@hooks/useRealm'
import { vsrPluginsPks } from '@hooks/useVotingPlugins'
import { useRouter } from 'next/router'
import Account from 'VoteStakeRegistry/components/Account/Account'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'

const account = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const router = useRouter()
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const { config } = useRealm()
  const tokenOwnerRecordPk = router?.query?.tokenOwnerRecordPk
  const isLockTokensMode =
    config?.account.communityTokenConfig.voterWeightAddin &&
    vsrPluginsPks.includes(
      config?.account.communityTokenConfig.voterWeightAddin?.toBase58()
    )

  const getAccountView = () => {
    if (isLockTokensMode) {
      return (
        <LockTokensAccount
          tokenOwnerRecordPk={tokenOwnerRecordPk}
        ></LockTokensAccount>
      )
    }
    return <Account></Account>
  }
  return getAccountView()
}

export default account
