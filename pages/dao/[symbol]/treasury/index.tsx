import PreviousRouteBtn from '@components/PreviousRouteBtn'
import StrategiesWrapper from '@components/TreasuryAccount/BigView/StrategiesWrapper'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { useTotalTreasuryPrice } from '@hooks/useTotalTreasuryPrice'
import { GovernedTokenAccount } from '@utils/tokens'
import { getTreasuryAccountItemInfo } from '@utils/treasuryTools'
import { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'

const Treasury = () => {
  const { governedTokenAccounts } = useGovernanceAssets()

  const [treasuryAccounts, setTreasuryAccounts] = useState<
    GovernedTokenAccount[]
  >([])
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)

  useEffect(() => {
    async function prepTreasuryAccounts() {
      setTreasuryAccounts(governedTokenAccounts)
    }
    prepTreasuryAccounts()
  }, [JSON.stringify(governedTokenAccounts)])

  const { totalPriceFormatted } = useTotalTreasuryPrice()

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 space-y-3">
          <div className="border-b border-fgd-4 pb-4 pt-2">
            <div className="flex items-center">
              <PreviousRouteBtn /> <h1 className="ml-3">Treasury</h1>
            </div>
          </div>
          {totalPriceFormatted && (
            <div className="pt-5 mb-5">
              <div className="mb-3">Total balance</div>
              <div>
                <h1>${totalPriceFormatted}</h1>
              </div>
            </div>
          )}
          <div className="flex flex-items flex-wrap">
            {treasuryAccounts.map((x) => (
              <TreasuryItem
                governedAccountTokenAccount={x}
                governanceNfts={governanceNfts}
                key={x?.governance?.pubkey.toBase58()}
              />
            ))}
          </div>
        </div>
      </div>
      <StrategiesWrapper></StrategiesWrapper>
    </>
  )
}

const TreasuryItem = ({ governedAccountTokenAccount, governanceNfts }) => {
  const {
    amountFormatted,
    logo,
    name,
    symbol,
    displayPrice,
  } = getTreasuryAccountItemInfo(governedAccountTokenAccount, governanceNfts)
  return name ? (
    <div className="flex flex-col border-fgd-4 border p-4 rounded-md mb-4 mr-4">
      <div className="flex flex-col pr-14">
        <div className="text-xs">{name}</div>
        <div className="font-bold">
          {amountFormatted} {symbol}
        </div>
      </div>

      <div className="flex flex-items space-between mt-5 items-end">
        {displayPrice && <span className="text-xs">${displayPrice}</span>}
        {logo && <img src={logo} className="w-10 h-10 ml-auto"></img>}
      </div>
    </div>
  ) : null
}
export default Treasury
