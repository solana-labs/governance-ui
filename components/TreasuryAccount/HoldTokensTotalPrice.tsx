import { useTotalTreasuryPrice } from '@hooks/useTotalTreasuryPrice'
const HoldTokensTotalPrice = () => {
  const { totalPriceFormatted } = useTotalTreasuryPrice()
  return totalPriceFormatted ? (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
      <p className="text-fgd-3">Treasury Balance</p>
      <span className="hero-text">${totalPriceFormatted}</span>
    </div>
  ) : null
}

export default HoldTokensTotalPrice
