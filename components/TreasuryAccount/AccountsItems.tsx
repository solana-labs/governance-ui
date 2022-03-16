import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { GovernedTokenAccount } from '@utils/tokens'
import React, { useEffect, useState } from 'react'
import AccountItem from './AccountItem'

const AccountsItems = () => {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const [treasuryAccounts, setTreasuryAccounts] = useState<
    GovernedTokenAccount[]
  >([])

  useEffect(() => {
    async function prepTreasuryAccounts() {
      if (governedTokenAccountsWithoutNfts.every((x) => x.mint && x.token)) {
        setTreasuryAccounts(governedTokenAccountsWithoutNfts)
      }
    }
    prepTreasuryAccounts()
  }, [JSON.stringify(governedTokenAccountsWithoutNfts)])

  return (
    <div className="space-y-3">
      {treasuryAccounts.map((accountWithGovernance) => {
        return (
          accountWithGovernance.transferAddress && (
            <AccountItem
              governedAccountTokenAccount={accountWithGovernance}
              key={accountWithGovernance?.transferAddress?.toBase58()}
            />
          )
        )
      })}
    </div>
  )
}

export default AccountsItems
