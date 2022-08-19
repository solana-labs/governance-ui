import useRealm from '@hooks/useRealm'
import { vsrPluginsPks } from '@hooks/useVotingPlugins'
import { useRouter } from 'next/router'
import Account from 'VoteStakeRegistry/components/Account/Account'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'

const account = () => {
  const router = useRouter()
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
