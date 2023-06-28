import React from 'react'
import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import Account from 'pages/dao/[symbol]/account/Account'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'
import { LockTokensAccount as HeliumLockTokensAccount } from 'HeliumVotePlugin/components/LockTokensAccount'

const AccountPage: React.FC = () => {
  const router = useRouter()
  const { vsrMode } = useRealm()
  const tokenOwnerRecordPk = router?.query?.tokenOwnerRecordPk

  if (vsrMode) {
    if (vsrMode === 'helium') {
      return (
        <HeliumLockTokensAccount /* tokenOwnerRecordPk={tokenOwnerRecordPk} */>
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

export default AccountPage
