import { useTotalTreasuryPrice } from '@hooks/useTotalTreasuryPrice'
const HoldTokensTotalPrice = () => {
  const { totalPriceFormatted } = useTotalTreasuryPrice()
  return (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
      <p className="text-fgd-3">Treasury Balance</p>
      <span className="hero-text">
        ${totalPriceFormatted ? totalPriceFormatted : 0}
      </span>
    </div>
  )
}

export default HoldTokensTotalPrice
