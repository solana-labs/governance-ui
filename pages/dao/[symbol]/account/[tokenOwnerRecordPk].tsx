import useRealm from '@hooks/useRealm'
import { vsrPluginsPks } from '@hooks/useVotingPlugins'
import { PROGRAM_ID as HELIUM_VSR_PROGRAM_ID } from '@helium/voter-stake-registry-sdk'
import { useRouter } from 'next/router'
import Account from 'VoteStakeRegistry/components/Account/Account'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'
import { LockTokensAccount as HeliumLockTokensAccount } from 'HeliumVoteStakeRegistry/components/LockTokensAccount'

const account = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const router = useRouter()
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const { config } = useRealm()
  const tokenOwnerRecordPk = router?.query?.tokenOwnerRecordPk
  const communityVsrPk = config?.account.communityTokenConfig.voterWeightAddin
  const isHeliumVsr =
    communityVsrPk && communityVsrPk.equals(HELIUM_VSR_PROGRAM_ID)
  const isLockTokensMode =
    communityVsrPk && vsrPluginsPks.includes(communityVsrPk.toBase58())

  if (isLockTokensMode) {
    if (isHeliumVsr) {
      return (
        <HeliumLockTokensAccount tokenOwnerRecordPk={tokenOwnerRecordPk}>
          <Account withHeader={false} displayPanel={false} />
        </HeliumLockTokensAccount>
      )
    }

    return (
      <LockTokensAccount tokenOwnerRecordPk={tokenOwnerRecordPk}>
        <Account withHeader={false} displayPanel={false} />
      </LockTokensAccount>
    )
  }

  return <Account />
}

export default account
