import useGovernances from '@hooks/useGovernances'
import { GovernedTokenAccount } from '@utils/tokens'
import React, { useEffect, useState } from 'react'
import TreasuryAccountItem from './TreasuryAccountItem'

const TreasuryAccountsItems = () => {
  const { governedTokenAccounts } = useGovernances()
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
      {treasuryAccounts.map((accountWithGovernance) => (
        <TreasuryAccountItem
          governedAccountTokenAccount={accountWithGovernance}
          key={accountWithGovernance?.governance?.pubkey.toBase58()}
        />
      ))}
    </div>
  )
}

export default TreasuryAccountsItems
