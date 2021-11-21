import useInstructions from '@hooks/useInstructions'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import React, { useEffect, useState } from 'react'
import TreasuryAccountItem from './TreasuryAccountItem'

const TreasuryAccountsItems = () => {
  const { governedTokenAccounts, getMintWithGovernances } = useInstructions()
  const [treasuryAccounts, setTreasuryAccounts] = useState<
    GovernedMultiTypeAccount[]
  >([])
  useEffect(() => {
    async function prepTreasuryAccounts() {
      const mintWithGovernances = await getMintWithGovernances()
      setTreasuryAccounts([
        ...(governedTokenAccounts as GovernedMultiTypeAccount[]),
        ...(mintWithGovernances as GovernedMultiTypeAccount[]),
      ])
    }
    prepTreasuryAccounts()
  }, [JSON.stringify(governedTokenAccounts)])
  return (
    <>
      {treasuryAccounts.map((accountWithGovernance) => (
        <TreasuryAccountItem
          governedAccount={accountWithGovernance}
          key={accountWithGovernance.governance.pubkey.toBase58()}
        />
      ))}
    </>
  )
}

export default TreasuryAccountsItems
