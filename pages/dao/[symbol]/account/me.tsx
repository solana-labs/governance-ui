import React from 'react'
import useRealm from '@hooks/useRealm'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'
import { LockTokensAccount as HeliumLockTokensAccount } from 'HeliumVotePlugin/components/LockTokensAccount'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwnerRecord'
import Account from './Account'

const AccountPage: React.FC = () => {
  const { vsrMode } = useRealm()

  const { data: tokenOwnerRecordPk } = useAddressQuery_CommunityTokenOwner()

  if (vsrMode) {
    if (vsrMode === 'helium') {
      return (
        <HeliumLockTokensAccount /* tokenOwnerRecordPk={tokenOwnerRecordPk} */>
          <Account withHeader={false} displayPanel={false} />
        </HeliumLockTokensAccount>
      )
    }

    return tokenOwnerRecordPk ? (
      <LockTokensAccount tokenOwnerRecordPk={tokenOwnerRecordPk}>
        <Account withHeader={false} displayPanel={false} />
      </LockTokensAccount>
    ) : null
  }

  return <Account />
}

export default AccountPage
