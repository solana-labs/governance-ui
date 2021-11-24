import useInstructions from '@hooks/useInstructions'
import { GovernedTokenAccount } from '@utils/tokens'
import React, { useEffect, useState } from 'react'
import TreasuryAccountItem from './TreasuryAccountItem'

const TreasuryAccountsItems = () => {
  const { governedTokenAccounts } = useInstructions()
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
    <>
      {treasuryAccounts.map((accountWithGovernance) => (
        <TreasuryAccountItem
          governedAccountTokenAccount={accountWithGovernance}
          key={accountWithGovernance?.governance?.pubkey.toBase58()}
        />
      ))}
    </>
  )
}

export default TreasuryAccountsItems
