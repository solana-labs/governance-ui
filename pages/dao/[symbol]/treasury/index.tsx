import PreviousRouteBtn from '@components/PreviousRouteBtn'
import AccountItem from '@components/TreasuryAccount/AccountItem'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { useTotalTreasuryPrice } from '@hooks/useTotalTreasuryPrice'
import { GovernedTokenAccount } from '@utils/tokens'
import { useEffect, useState } from 'react'

const Treasury = () => {
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
  const { totalPriceFormatted } = useTotalTreasuryPrice()
  return (
    <div className="grid grid-cols-12">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 space-y-3">
        <div className="border-b border-fgd-4 pb-4 pt-2">
          <div className="flex items-center">
            <PreviousRouteBtn /> <h1 className="ml-3">Treasury</h1>
          </div>
        </div>
        <div className="pt-5 mb-5">
          <div className="mb-3">Total balance</div>
          <div>
            <h1>${totalPriceFormatted}</h1>
          </div>
        </div>
        <div>
          {treasuryAccounts.map((x) => (
            <AccountItem
              governedAccountTokenAccount={x}
              key={x?.governance?.pubkey.toBase58()}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
export default Treasury
