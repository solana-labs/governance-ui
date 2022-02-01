import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { GovernedTokenAccount } from '@utils/tokens'
import React, { useEffect, useState } from 'react'
import AccountItem from './AccountItem'
import AccountItemNFT from './AccountItemNFT'
import AccountItemSol from './AccountItemSol'

const AccountsItems = () => {
  const { governedTokenAccounts } = useGovernanceAssets()
  const [treasuryAccounts, setTreasuryAccounts] = useState<
    GovernedTokenAccount[]
  >([])

  useEffect(() => {
    async function prepTreasuryAccounts() {
      setTreasuryAccounts(governedTokenAccounts)
    }
    prepTreasuryAccounts()
  }, [JSON.stringify(governedTokenAccounts)])
  return (
    <div className="space-y-3">
      {treasuryAccounts.map((accountWithGovernance) => {
        //TODO if more non generic types of account item make more granular components inside accountItem
        if (accountWithGovernance.isNft) {
          return (
            <AccountItemNFT
              border={true}
              governedAccountTokenAccount={accountWithGovernance}
              key={accountWithGovernance?.governance?.pubkey.toBase58()}
            />
          )
        }
        if (accountWithGovernance.isSol) {
          return (
            <AccountItemSol
              governedAccountTokenAccount={accountWithGovernance}
              key={accountWithGovernance?.governance?.pubkey.toBase58()}
            />
          )
        }
        return (
          <AccountItem
            governedAccountTokenAccount={accountWithGovernance}
            key={accountWithGovernance?.governance?.pubkey.toBase58()}
          />
        )
      })}
    </div>
  )
}

export default AccountsItems
