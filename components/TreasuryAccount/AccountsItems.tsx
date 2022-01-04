import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { GovernedTokenAccount } from '@utils/tokens'
import React, { useEffect, useState } from 'react'
import AccountItem from './AccountItem'
import AccountItemNFT from './AccountItemNFT'

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
        if (
          accountWithGovernance.mint?.publicKey.toBase58() ===
          DEFAULT_NFT_TREASURY_MINT
        ) {
          return (
            <AccountItemNFT
              governedAccountTokenAccount={accountWithGovernance}
              key={accountWithGovernance?.governance?.pubkey.toBase58()}
            />
          )
        } else {
          return (
            <AccountItem
              governedAccountTokenAccount={accountWithGovernance}
              key={accountWithGovernance?.governance?.pubkey.toBase58()}
            />
          )
        }
      })}
    </div>
  )
}

export default AccountsItems
