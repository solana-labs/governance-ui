import useGovernanceAssets from '@hooks/useGovernanceAssets'
import React from 'react'
import AccountItem from './AccountItem'

const AccountsItems = () => {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  console.log(governedTokenAccountsWithoutNfts)
  return (
    <div className="space-y-3">
      {governedTokenAccountsWithoutNfts.map((account) => {
        return (
          <AccountItem
            governedAccountTokenAccount={account}
            key={account?.extensions.transferAddress?.toBase58()}
          />
        )
      })}
    </div>
  )
}

export default AccountsItems
