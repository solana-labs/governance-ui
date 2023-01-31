import React from 'react'
import useRealm from '@hooks/useRealm'
import { vsrPluginsPks, heliumVsrPluginsPks } from '@hooks/useVotingPlugins'
import { useRouter } from 'next/router'
import { default as VoteStakeRegistryAccount } from 'VoteStakeRegistry/components/Account/Account'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'
import { LockTokensAccount as HeliumLockTokensAccount } from 'HeliumVoteStakeRegistry/components/LockTokensAccount'

const Account: React.FC<any> = () => {
  const router = useRouter()
  const { config } = useRealm()
  const tokenOwnerRecordPk = router?.query?.tokenOwnerRecordPk
  const communityVsrPk = config?.account.communityTokenConfig.voterWeightAddin
  const isDefaultVsrMode =
    communityVsrPk && vsrPluginsPks.includes(communityVsrPk.toBase58())
  const isHeliumVsrMode =
    communityVsrPk && heliumVsrPluginsPks.includes(communityVsrPk.toBase58())

  if (isDefaultVsrMode || isHeliumVsrMode) {
    if (isHeliumVsrMode) {
      return (
        <HeliumLockTokensAccount tokenOwnerRecordPk={tokenOwnerRecordPk}>
          <VoteStakeRegistryAccount withHeader={false} displayPanel={false} />
        </HeliumLockTokensAccount>
      )
    }

    return (
      <LockTokensAccount tokenOwnerRecordPk={tokenOwnerRecordPk}>
        <VoteStakeRegistryAccount withHeader={false} displayPanel={false} />
      </LockTokensAccount>
    )
  }

  return <VoteStakeRegistryAccount />
}

export default Account
