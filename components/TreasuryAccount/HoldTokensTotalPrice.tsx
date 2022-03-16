import { useTotalTreasuryPrice } from '@hooks/useTotalTreasuryPrice'
const HoldTokensTotalPrice = () => {
  const { totalPriceFormatted } = useTotalTreasuryPrice()
  return totalPriceFormatted ? (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
      <p className="text-fgd-3 text-xs">Treasury Balance</p>
      <h3 className="mb-0">${totalPriceFormatted}</h3>
    </div>
  ) : null
}

export default HoldTokensTotalPrice
