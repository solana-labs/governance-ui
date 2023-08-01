import React from 'react'
import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import { default as VoteStakeRegistryAccount } from '@components/Account'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'
import { LockTokensAccount as HeliumLockTokensAccount } from 'HeliumVotePlugin/components/LockTokensAccount'

const Account: React.FC = () => {
  const router = useRouter()
  const { vsrMode } = useRealm()
  const tokenOwnerRecordPk = router?.query?.tokenOwnerRecordPk

  if (vsrMode) {
    if (vsrMode === 'helium') {
      return (
        <HeliumLockTokensAccount /* tokenOwnerRecordPk={tokenOwnerRecordPk} */>
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
